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

/// @title XAppScoring
/// @notice Stores weekly app scores on-chain for the VeBetterDAO ecosystem.
/// @dev Scoring computation runs off-chain (Navigator strategy agent) and results are
/// submitted to this contract via SCORER_ROLE. Supports tied rankings per the PRD spec:
/// same score → same rank, if ties exceed topN quota the list extends.
contract XAppScoring is AccessControlUpgradeable, UUPSUpgradeable {
    // ---------------- Roles ----------------
    bytes32 public constant UPGRADER_ROLE = keccak256("UPGRADER_ROLE");
    bytes32 public constant SCORER_ROLE = keccak256("SCORER_ROLE");

    // ---------------- Structs ----------------
    struct ScoreBreakdown {
        uint256 appScore;           // On-chain performance & app quality score
        uint256 b3trFlowTrend;      // B3TR flow trend score
        uint256 proofSubmissionRate; // Proof submission rate score
        uint256 newUsers;           // New users score
    }

    struct AppScore {
        bytes32 appId;
        uint256 round;
        uint256 totalScore;
        ScoreBreakdown breakdown;
        uint256 rank;
        uint256 timestamp;
    }

    // ---------------- Errors ----------------
    error RoundAlreadyFinalized(uint256 round);
    error RoundNotFinalized(uint256 round);
    error ArrayLengthMismatch();
    error EmptyArray();
    error UnauthorizedUser(address user);

    // ---------------- Events ----------------
    event ScoresRecorded(uint256 indexed round, uint256 appCount);
    event RoundFinalized(uint256 indexed round, uint256 rankedAppCount);
    event RoundRankingsUpdated(uint256 indexed round);

    // ---------------- Storage ----------------
    /// @custom:storage-location erc7201:b3tr.storage.XAppScoring
    struct XAppScoringStorage {
        // appId => round => AppScore
        mapping(bytes32 => mapping(uint256 => AppScore)) scores;
        // round => ranked appIds (ordered by score descending)
        mapping(uint256 => bytes32[]) roundRankings;
        // round => finalized flag
        mapping(uint256 => bool) roundFinalized;
        // appId => rounds[] (for history queries)
        mapping(bytes32 => uint256[]) appRoundHistory;
    }

    // keccak256(abi.encode(uint256(keccak256("b3tr.storage.XAppScoring")) - 1)) & ~bytes32(uint256(0xff))
    bytes32 private constant XAppScoringStorageLocation =
        0xd182bc0e6e089a7bf0d4058006379c823a19c5226bb45b70656fb3e49a6cde00;

    function _getStorage() private pure returns (XAppScoringStorage storage $) {
        assembly {
            $.slot := XAppScoringStorageLocation
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
    /// @param scorer Address to be assigned the SCORER_ROLE (initially the Navigator service).
    function initialize(
        address defaultAdmin,
        address upgrader,
        address scorer
    ) public initializer {
        require(defaultAdmin != address(0), "XAppScoring: zero admin address");
        require(upgrader != address(0), "XAppScoring: zero upgrader address");
        require(scorer != address(0), "XAppScoring: zero scorer address");

        __AccessControl_init();
        __UUPSUpgradeable_init();

        _grantRole(DEFAULT_ADMIN_ROLE, defaultAdmin);
        _grantRole(UPGRADER_ROLE, upgrader);
        _grantRole(SCORER_ROLE, scorer);
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
        return "1";
    }

    // ---------------- External: Scoring ----------------

    /// @notice Records raw scores for apps in a round. Can be called multiple times per round
    /// to batch scores. Must be called before finalizeRound.
    /// @param round The round number.
    /// @param appIds Array of app IDs.
    /// @param totalScores Array of total scores (0-100 scale, multiplied by 100 for precision).
    /// @param breakdowns Array of score breakdowns.
    function recordScores(
        uint256 round,
        bytes32[] calldata appIds,
        uint256[] calldata totalScores,
        ScoreBreakdown[] calldata breakdowns
    ) external onlyRoleOrAdmin(SCORER_ROLE) {
        XAppScoringStorage storage $ = _getStorage();
        if ($.roundFinalized[round]) revert RoundAlreadyFinalized(round);
        if (appIds.length == 0) revert EmptyArray();
        if (appIds.length != totalScores.length || totalScores.length != breakdowns.length) {
            revert ArrayLengthMismatch();
        }

        for (uint256 i = 0; i < appIds.length; i++) {
            $.scores[appIds[i]][round] = AppScore({
                appId: appIds[i],
                round: round,
                totalScore: totalScores[i],
                breakdown: breakdowns[i],
                rank: 0,
                timestamp: block.timestamp
            });

            // Track which rounds this app has scores (avoid duplicates)
            uint256[] storage history = $.appRoundHistory[appIds[i]];
            if (history.length == 0 || history[history.length - 1] != round) {
                history.push(round);
            }
        }

        emit ScoresRecorded(round, appIds.length);
    }

    /// @notice Finalizes a round by setting the ranked order of apps.
    /// Rankings are computed off-chain and submitted here. Ties should have the same
    /// position in the array but the off-chain logic determines the tied rank value.
    /// @param round The round number to finalize.
    /// @param rankedAppIds Ordered array of app IDs (highest score first).
    function finalizeRound(
        uint256 round,
        bytes32[] calldata rankedAppIds
    ) external onlyRoleOrAdmin(SCORER_ROLE) {
        XAppScoringStorage storage $ = _getStorage();
        if ($.roundFinalized[round]) revert RoundAlreadyFinalized(round);
        if (rankedAppIds.length == 0) revert EmptyArray();

        // Assign ranks with tie handling: same score → same rank
        uint256 currentRank = 1;
        uint256 previousScore = $.scores[rankedAppIds[0]][round].totalScore;

        for (uint256 i = 0; i < rankedAppIds.length; i++) {
            AppScore storage score = $.scores[rankedAppIds[i]][round];
            if (score.appId == bytes32(0)) continue; // skip un-scored apps

            // If score differs from previous, advance rank to current position
            if (score.totalScore != previousScore) {
                currentRank = i + 1;
                previousScore = score.totalScore;
            }
            // Same score → same rank (ties do not skip positions)
            score.rank = currentRank;
        }

        $.roundRankings[round] = rankedAppIds;
        $.roundFinalized[round] = true;

        emit RoundFinalized(round, rankedAppIds.length);
    }

    // ---------------- External: Admin ----------------

    /// @notice Allows SCORER_ROLE to update rankings of an already-finalized round.
    /// @param round The round number.
    /// @param rankedAppIds New ordered array of app IDs.
    function updateRoundRankings(
        uint256 round,
        bytes32[] calldata rankedAppIds
    ) external onlyRoleOrAdmin(SCORER_ROLE) {
        XAppScoringStorage storage $ = _getStorage();
        if (rankedAppIds.length == 0) revert EmptyArray();

        $.roundRankings[round] = rankedAppIds;

        // Re-assign ranks
        uint256 currentRank = 1;
        uint256 previousScore = $.scores[rankedAppIds[0]][round].totalScore;
        for (uint256 i = 0; i < rankedAppIds.length; i++) {
            AppScore storage score = $.scores[rankedAppIds[i]][round];
            if (score.appId == bytes32(0)) continue;
            if (score.totalScore != previousScore) {
                currentRank = i + 1;
                previousScore = score.totalScore;
            }
            score.rank = currentRank;
        }

        emit RoundRankingsUpdated(round);
    }

    // ---------------- Getters ----------------

    /// @notice Returns the score for a specific app in a specific round.
    function getAppScore(bytes32 appId, uint256 round) external view returns (AppScore memory) {
        return _getStorage().scores[appId][round];
    }

    /// @notice Returns the score history for an app across multiple rounds.
    function getAppScoreHistory(bytes32 appId, uint256[] calldata rounds)
        external view returns (AppScore[] memory)
    {
        XAppScoringStorage storage $ = _getStorage();
        AppScore[] memory history = new AppScore[](rounds.length);
        for (uint256 i = 0; i < rounds.length; i++) {
            history[i] = $.scores[appId][rounds[i]];
        }
        return history;
    }

    /// @notice Returns the latest score for an app. Reverts if the app has no scores.
    function getLatestAppScore(bytes32 appId) external view returns (AppScore memory) {
        XAppScoringStorage storage $ = _getStorage();
        uint256[] storage history = $.appRoundHistory[appId];
        if (history.length == 0) revert EmptyArray();
        return $.scores[appId][history[history.length - 1]];
    }

    /// @notice Returns the ranked app IDs for a finalized round.
    function getRoundRankings(uint256 round) external view returns (bytes32[] memory) {
        XAppScoringStorage storage $ = _getStorage();
        if (!$.roundFinalized[round]) revert RoundNotFinalized(round);
        return $.roundRankings[round];
    }

    /// @notice Returns the app IDs and their ranks for a finalized round.
    function getRoundResults(uint256 round)
        external view
        returns (bytes32[] memory appIds, uint256[] memory ranks)
    {
        XAppScoringStorage storage $ = _getStorage();
        if (!$.roundFinalized[round]) revert RoundNotFinalized(round);
        bytes32[] storage ranking = $.roundRankings[round];
        uint256 len = ranking.length;
        appIds = new bytes32[](len);
        ranks = new uint256[](len);
        for (uint256 i = 0; i < len; i++) {
            appIds[i] = ranking[i];
            ranks[i] = $.scores[ranking[i]][round].rank;
        }
    }

    /// @notice Returns whether a round has been finalized.
    function isRoundFinalized(uint256 round) external view returns (bool) {
        return _getStorage().roundFinalized[round];
    }

    /// @notice Returns the rounds an app has scored in.
    function getAppScoredRounds(bytes32 appId) external view returns (uint256[] memory) {
        return _getStorage().appRoundHistory[appId];
    }
}
