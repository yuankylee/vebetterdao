// SPDX-License-Identifier: MIT

//                                      #######
//                                 ################
//                               ####################
//                             ###########   #########
//                            #########      #########
//          #######          #########       #########
//          #########       #########      ##########
//           ##########     ########     ####################
//            ##########   #########  #########################
//              ################### ############################
//               #################  ##########          ########
//                 ##############      ###              ########
//                  ############                       #########
//                    ##########                     ##########
//                     ########                    ###########
//                       ###                    ############
//                                          ##############
//                                    #################
//                                   ##############
//                                   #########

pragma solidity 0.8.20;

import { AccessControlUpgradeable } from "@openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol";
import { UUPSUpgradeable } from "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";

/// @title XAppReviewManager
/// @notice Handles user reviews and ratings for X2Earn apps in the VeBetterDAO ecosystem.
/// @dev Upgradeable contract with ERC-7201 namespaced storage. Rating (1-5 stars) and text reviews
/// are independent operations: users can rate without reviewing and vice versa. Each user has at most
/// one rating per app (upsert via submitRating/updateRating). Other users can upvote, downvote,
/// or report reviews. Reviews are auto-hidden after 20 reports.
contract XAppReviewManager is AccessControlUpgradeable, UUPSUpgradeable {
    // ---------------- Roles ----------------
    bytes32 public constant UPGRADER_ROLE = keccak256("UPGRADER_ROLE");
    bytes32 public constant MODERATOR_ROLE = keccak256("MODERATOR_ROLE");

    // ---------------- Constants ----------------
    uint8 public constant MIN_RATING = 1;
    uint8 public constant MAX_RATING = 5;
    uint256 public constant MAX_TITLE_LENGTH = 200;
    uint256 public constant MAX_CONTENT_LENGTH = 2000;
    uint256 public constant AUTO_HIDE_REPORT_THRESHOLD = 20;

    // ---------------- Enums ----------------
    enum VoteType {
        NONE,
        UPVOTE,
        DOWNVOTE,
        REPORT
    }

    // ---------------- Structs ----------------
    struct Review {
        uint256 id;
        bytes32 appId;
        address reviewer;
        uint8 rating; // deprecated — kept for storage-layout compatibility
        string title;
        string content;
        uint256 createdAt;
        uint256 updatedAt;
        uint256 upvotes;
        uint256 downvotes;
        uint256 reports;
        bool hidden;
    }

    struct VoteEntry {
        address voter;
        VoteType voteType;
        uint256 timestamp;
    }

    // ---------------- Errors ----------------
    error InvalidRating(uint8 rating);
    error TitleTooLong(uint256 length, uint256 max);
    error ContentTooLong(uint256 length, uint256 max);
    error ReviewNotFound(uint256 reviewId);
    error ReviewIsHidden(uint256 reviewId);
    error NotReviewAuthor(uint256 reviewId, address caller);
    error CannotVoteOwnReview(uint256 reviewId);
    error AlreadyVoted(uint256 reviewId, address voter, VoteType existingVote);
    error UnauthorizedUser(address user);
    error AlreadyRated(bytes32 appId, address rater);

    // ---------------- Events ----------------
    event ReviewCreated(
        uint256 indexed reviewId,
        bytes32 indexed appId,
        address indexed reviewer
    );
    event ReviewUpdated(uint256 indexed reviewId);
    event ReviewVoted(
        uint256 indexed reviewId,
        address indexed voter,
        VoteType voteType
    );
    event ReviewHidden(uint256 indexed reviewId);
    event ReviewUnhidden(uint256 indexed reviewId);
    event RatingSubmitted(bytes32 indexed appId, address indexed rater, uint8 rating);
    event RatingUpdated(bytes32 indexed appId, address indexed rater, uint8 rating);

    // ---------------- Storage ----------------
    /// @custom:storage-location erc7201:b3tr.storage.XAppReviewManager
    struct XAppReviewManagerStorage {
        uint256 nextReviewId;
        mapping(uint256 => Review) reviews;
        mapping(bytes32 => uint256[]) appReviewIds;
        mapping(address => uint256[]) userReviewIds;
        mapping(uint256 => mapping(address => VoteType)) reviewVotes;
        mapping(uint256 => VoteEntry[]) voteHistory;
        mapping(bytes32 => uint256) appReviewCount;
        // appId => sum of all ratings * 100 (for precision, divide by count to get avg)
        mapping(bytes32 => uint256) appRatingSum;
        // appId => rater => rating (1-5), 0 means not rated
        mapping(bytes32 => mapping(address => uint8)) userRatings;
        // appId => number of unique raters
        mapping(bytes32 => uint256) appRatingCount;
    }

    // keccak256(abi.encode(uint256(keccak256("b3tr.storage.XAppReviewManager")) - 1)) & ~bytes32(uint256(0xff))
    bytes32 private constant XAppReviewManagerStorageLocation =
        0x496a0144db85d0a76089a964a1bb51cc6084a4ba98297bcf893c5b54a1a70300;

    function _getStorage() private pure returns (XAppReviewManagerStorage storage $) {
        assembly {
            $.slot := XAppReviewManagerStorageLocation
        }
    }

    // ---------------- Initialization ----------------

    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {
        _disableInitializers();
    }

    /// @notice Initializes the contract with access control.
    /// @param defaultAdmin Address to be assigned the DEFAULT_ADMIN_ROLE.
    /// @param upgrader Address to be assigned the UPGRADER_ROLE.
    function initialize(address defaultAdmin, address upgrader) public initializer {
        require(defaultAdmin != address(0), "XAppReviewManager: zero admin address");
        require(upgrader != address(0), "XAppReviewManager: zero upgrader address");

        __AccessControl_init();
        __UUPSUpgradeable_init();

        _grantRole(DEFAULT_ADMIN_ROLE, defaultAdmin);
        _grantRole(UPGRADER_ROLE, upgrader);

        XAppReviewManagerStorage storage $ = _getStorage();
        $.nextReviewId = 1;
    }

    // ---------------- Modifiers ----------------

    modifier onlyRoleOrAdmin(bytes32 role) {
        if (!hasRole(role, msg.sender) && !hasRole(DEFAULT_ADMIN_ROLE, msg.sender)) {
            revert UnauthorizedUser(msg.sender);
        }
        _;
    }

    // ---------------- UUPS ----------------

    function _authorizeUpgrade(address) internal override onlyRole(UPGRADER_ROLE) {}

    function version() public pure returns (string memory) {
        return "2";
    }

    // ---------------- External: Review CRUD ----------------

    /// @notice Creates a review for an app. Caller must have received rewards from the app
    /// (eligibility is verified off-chain via the indexer before the transaction).
    /// @param appId The hashed app ID from X2EarnApps.
    /// @param title Review title (max 200 chars).
    /// @param content Review content (max 2000 chars).
    /// @return reviewId The ID of the newly created review.
    function createReview(
        bytes32 appId,
        string calldata title,
        string calldata content
    ) external returns (uint256 reviewId) {
        if (bytes(title).length > MAX_TITLE_LENGTH) revert TitleTooLong(bytes(title).length, MAX_TITLE_LENGTH);
        if (bytes(content).length > MAX_CONTENT_LENGTH) revert ContentTooLong(bytes(content).length, MAX_CONTENT_LENGTH);

        XAppReviewManagerStorage storage $ = _getStorage();
        reviewId = $.nextReviewId++;

        $.reviews[reviewId] = Review({
            id: reviewId,
            appId: appId,
            reviewer: msg.sender,
            rating: 0,
            title: title,
            content: content,
            createdAt: block.timestamp,
            updatedAt: block.timestamp,
            upvotes: 0,
            downvotes: 0,
            reports: 0,
            hidden: false
        });

        $.appReviewIds[appId].push(reviewId);
        $.userReviewIds[msg.sender].push(reviewId);
        $.appReviewCount[appId]++;

        emit ReviewCreated(reviewId, appId, msg.sender);
    }

    /// @notice Edits an existing review. Only the original author can edit.
    /// @param reviewId The ID of the review to edit.
    /// @param title New title (max 200 chars).
    /// @param content New content (max 2000 chars).
    function editReview(
        uint256 reviewId,
        string calldata title,
        string calldata content
    ) external {
        XAppReviewManagerStorage storage $ = _getStorage();
        Review storage review = $.reviews[reviewId];
        if (review.id == 0) revert ReviewNotFound(reviewId);
        if (review.reviewer != msg.sender) revert NotReviewAuthor(reviewId, msg.sender);
        if (bytes(title).length > MAX_TITLE_LENGTH) revert TitleTooLong(bytes(title).length, MAX_TITLE_LENGTH);
        if (bytes(content).length > MAX_CONTENT_LENGTH) revert ContentTooLong(bytes(content).length, MAX_CONTENT_LENGTH);

        review.title = title;
        review.content = content;
        review.updatedAt = block.timestamp;

        emit ReviewUpdated(reviewId);
    }

    // ---------------- External: Rating ----------------

    /// @notice Submits a rating for an app. Each user can rate an app once; subsequent calls revert.
    /// @param appId The hashed app ID from X2EarnApps.
    /// @param rating Star rating (1-5).
    function submitRating(bytes32 appId, uint8 rating) external {
        if (rating < MIN_RATING || rating > MAX_RATING) revert InvalidRating(rating);

        XAppReviewManagerStorage storage $ = _getStorage();
        if ($.userRatings[appId][msg.sender] != 0) revert AlreadyRated(appId, msg.sender);

        $.userRatings[appId][msg.sender] = rating;
        $.appRatingCount[appId]++;
        $.appRatingSum[appId] += uint256(rating) * 100;

        emit RatingSubmitted(appId, msg.sender, rating);
    }

    /// @notice Updates an existing rating for an app.
    /// @param appId The hashed app ID from X2EarnApps.
    /// @param rating New star rating (1-5).
    function updateRating(bytes32 appId, uint8 rating) external {
        if (rating < MIN_RATING || rating > MAX_RATING) revert InvalidRating(rating);

        XAppReviewManagerStorage storage $ = _getStorage();
        uint8 previous = $.userRatings[appId][msg.sender];
        if (previous == 0) revert UnauthorizedUser(msg.sender);

        $.appRatingSum[appId] = $.appRatingSum[appId] - uint256(previous) * 100 + uint256(rating) * 100;
        $.userRatings[appId][msg.sender] = rating;

        emit RatingUpdated(appId, msg.sender, rating);
    }

    // ---------------- External: Voting ----------------

    /// @notice Votes on a review (upvote, downvote, or report). Cannot vote on own review.
    /// Changing a vote replaces the previous vote.
    /// @param reviewId The ID of the review to vote on.
    /// @param voteType The type of vote (UPVOTE, DOWNVOTE, or REPORT).
    function voteOnReview(uint256 reviewId, VoteType voteType) external {
        if (voteType == VoteType.NONE) revert(); // must pick a valid vote type

        XAppReviewManagerStorage storage $ = _getStorage();
        Review storage review = $.reviews[reviewId];
        if (review.id == 0) revert ReviewNotFound(reviewId);
        if (review.hidden) revert ReviewIsHidden(reviewId);
        if (review.reviewer == msg.sender) revert CannotVoteOwnReview(reviewId);

        VoteType existingVote = $.reviewVotes[reviewId][msg.sender];
        if (existingVote == voteType) revert AlreadyVoted(reviewId, msg.sender, existingVote);

        // Remove previous vote counts
        if (existingVote == VoteType.UPVOTE) {
            review.upvotes = review.upvotes > 0 ? review.upvotes - 1 : 0;
        } else if (existingVote == VoteType.DOWNVOTE) {
            review.downvotes = review.downvotes > 0 ? review.downvotes - 1 : 0;
        } else if (existingVote == VoteType.REPORT) {
            review.reports = review.reports > 0 ? review.reports - 1 : 0;
        }

        // Apply new vote
        $.reviewVotes[reviewId][msg.sender] = voteType;
        $.voteHistory[reviewId].push(VoteEntry({
            voter: msg.sender,
            voteType: voteType,
            timestamp: block.timestamp
        }));

        if (voteType == VoteType.UPVOTE) {
            review.upvotes++;
        } else if (voteType == VoteType.DOWNVOTE) {
            review.downvotes++;
        } else if (voteType == VoteType.REPORT) {
            review.reports++;
            if (review.reports >= AUTO_HIDE_REPORT_THRESHOLD) {
                review.hidden = true;
                emit ReviewHidden(reviewId);
            }
        }

        emit ReviewVoted(reviewId, msg.sender, voteType);
    }

    // ---------------- External: Moderation ----------------

    /// @notice Unhides a review that was auto-hidden due to reports.
    /// @param reviewId The ID of the review to unhide.
    function unhideReview(uint256 reviewId) external onlyRoleOrAdmin(MODERATOR_ROLE) {
        XAppReviewManagerStorage storage $ = _getStorage();
        Review storage review = $.reviews[reviewId];
        if (review.id == 0) revert ReviewNotFound(reviewId);
        review.hidden = false;
        emit ReviewUnhidden(reviewId);
    }

    // ---------------- Getters ----------------

    /// @notice Returns a single review by ID.
    function getReview(uint256 reviewId) external view returns (Review memory) {
        XAppReviewManagerStorage storage $ = _getStorage();
        Review memory review = $.reviews[reviewId];
        if (review.id == 0) revert ReviewNotFound(reviewId);
        return review;
    }

    /// @notice Returns all review IDs for a given app.
    function getAppReviewIds(bytes32 appId) external view returns (uint256[] memory) {
        return _getStorage().appReviewIds[appId];
    }

    /// @notice Returns all review IDs created by a user.
    function getUserReviewIds(address user) external view returns (uint256[] memory) {
        return _getStorage().userReviewIds[user];
    }

    /// @notice Returns aggregate review stats for an app.
    /// @return count Total number of reviews.
    /// @return avgRating Deprecated — always 0. Use getAppRatingStats() for rating data.
    function getAppReviewStats(bytes32 appId) external view returns (uint256 count, uint256 avgRating) {
        count = _getStorage().appReviewCount[appId];
    }

    /// @notice Returns the vote history for a review.
    function getVoteHistory(uint256 reviewId) external view returns (VoteEntry[] memory) {
        XAppReviewManagerStorage storage $ = _getStorage();
        if ($.reviews[reviewId].id == 0) revert ReviewNotFound(reviewId);
        return $.voteHistory[reviewId];
    }

    /// @notice Returns a user's vote on a specific review.
    function getUserVote(uint256 reviewId, address user) external view returns (VoteType) {
        return _getStorage().reviewVotes[reviewId][user];
    }

    /// @notice Returns the total number of reviews created (the next review ID minus 1).
    function totalReviews() external view returns (uint256) {
        return _getStorage().nextReviewId - 1;
    }

    /// @notice Returns a user's rating for an app (0 if not rated).
    function getUserRating(bytes32 appId, address user) external view returns (uint8) {
        return _getStorage().userRatings[appId][user];
    }

    /// @notice Returns aggregate rating stats for an app.
    /// @return count Total number of unique raters.
    /// @return avgRating Average rating scaled by 100 (divide by 100 for display).
    function getAppRatingStats(bytes32 appId) external view returns (uint256 count, uint256 avgRating) {
        XAppReviewManagerStorage storage $ = _getStorage();
        count = $.appRatingCount[appId];
        if (count > 0) {
            avgRating = $.appRatingSum[appId] / count;
        }
    }
}
