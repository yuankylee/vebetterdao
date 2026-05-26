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

/// @title XAppBadges
/// @notice Manages badge definitions and awards for X2Earn apps in the VeBetterDAO ecosystem.
/// @dev Three badge types: Top Ecosystem dApp, Top Distribution Performer, Navigators' Pick.
/// Badges are awarded each round based on scoring results (from XAppScoring) and distribution data.
/// Apps can toggle badge visibility between public and private.
contract XAppBadges is AccessControlUpgradeable, UUPSUpgradeable {
    // ---------------- Roles ----------------
    bytes32 public constant UPGRADER_ROLE = keccak256("UPGRADER_ROLE");
    bytes32 public constant BADGE_MANAGER_ROLE = keccak256("BADGE_MANAGER_ROLE");

    // ---------------- Enums ----------------
    enum BadgeType {
        TOP_ECOSYSTEM_DAPP,
        TOP_DISTRIBUTION_PERFORMER,
        NAVIGATORS_PICK
    }

    enum BadgeStatus {
        UNPUBLISHED,
        PUBLISHED
    }

    // ---------------- Structs ----------------
    struct BadgeDefinition {
        BadgeType badgeType;
        string name;
        string imageURI;
        string description;
        BadgeStatus status;
    }

    struct BadgeAward {
        bytes32 appId;
        uint256 round;
        BadgeType badgeType;
        uint256 rank;
        uint256 timestamp;
        bool isPrivate;
    }

    // ---------------- Errors ----------------
    error UnauthorizedUser(address user);
    error EmptyArray();

    // ---------------- Events ----------------
    event BadgeDefinitionUpdated(BadgeType indexed badgeType);
    event BadgeAwarded(
        bytes32 indexed appId,
        uint256 indexed round,
        BadgeType badgeType,
        uint256 rank
    );
    event BadgePrivacyUpdated(
        bytes32 indexed appId,
        uint256 indexed round,
        BadgeType badgeType,
        bool isPrivate
    );

    // ---------------- Storage ----------------
    /// @custom:storage-location erc7201:b3tr.storage.XAppBadges
    struct XAppBadgesStorage {
        // badgeType => definition
        mapping(BadgeType => BadgeDefinition) badgeDefinitions;
        // appId => round => badgeTypes awarded
        mapping(bytes32 => mapping(uint256 => BadgeType[])) appRoundBadges;
        // appId => badge history (all awards ever received)
        mapping(bytes32 => BadgeAward[]) appBadgeHistory;
        // round => array of appIds that received any badge
        mapping(uint256 => bytes32[]) roundAwardees;
    }

    // keccak256(abi.encode(uint256(keccak256("b3tr.storage.XAppBadges")) - 1)) & ~bytes32(uint256(0xff))
    bytes32 private constant XAppBadgesStorageLocation =
        0xc27ceca0a18f9f56d3c39da69454163f5b68abe15580becfbe990e1ff8c8d300;

    function _getStorage() private pure returns (XAppBadgesStorage storage $) {
        assembly {
            $.slot := XAppBadgesStorageLocation
        }
    }

    // ---------------- Initialization ----------------

    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {
        _disableInitializers();
    }

    /// @notice Initializes the contract with access control and default badge definitions.
    /// @param defaultAdmin Address to be assigned the DEFAULT_ADMIN_ROLE.
    /// @param upgrader Address to be assigned the UPGRADER_ROLE.
    /// @param badgeManager Address to be assigned the BADGE_MANAGER_ROLE.
    function initialize(
        address defaultAdmin,
        address upgrader,
        address badgeManager
    ) public initializer {
        require(defaultAdmin != address(0), "XAppBadges: zero admin address");
        require(upgrader != address(0), "XAppBadges: zero upgrader address");
        require(badgeManager != address(0), "XAppBadges: zero badgeManager address");

        __AccessControl_init();
        __UUPSUpgradeable_init();

        _grantRole(DEFAULT_ADMIN_ROLE, defaultAdmin);
        _grantRole(UPGRADER_ROLE, upgrader);
        _grantRole(BADGE_MANAGER_ROLE, badgeManager);

        // Initialize default badge definitions as published
        XAppBadgesStorage storage $ = _getStorage();
        $.badgeDefinitions[BadgeType.TOP_ECOSYSTEM_DAPP] = BadgeDefinition({
            badgeType: BadgeType.TOP_ECOSYSTEM_DAPP,
            name: "Top Ecosystem dApp",
            imageURI: "",
            description: "",
            status: BadgeStatus.PUBLISHED
        });
        $.badgeDefinitions[BadgeType.TOP_DISTRIBUTION_PERFORMER] = BadgeDefinition({
            badgeType: BadgeType.TOP_DISTRIBUTION_PERFORMER,
            name: "Top Distribution Performer",
            imageURI: "",
            description: "",
            status: BadgeStatus.PUBLISHED
        });
        $.badgeDefinitions[BadgeType.NAVIGATORS_PICK] = BadgeDefinition({
            badgeType: BadgeType.NAVIGATORS_PICK,
            name: "Navigators' Pick",
            imageURI: "",
            description: "",
            status: BadgeStatus.PUBLISHED
        });
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

    // ---------------- External: Badge Definitions ----------------

    /// @notice Sets or updates a badge definition (name, image, description, status).
    /// Badge images are stored as IPFS URIs.
    function setBadgeDefinition(
        BadgeType badgeType,
        string calldata name,
        string calldata imageURI,
        string calldata description,
        BadgeStatus status
    ) external onlyRoleOrAdmin(BADGE_MANAGER_ROLE) {
        XAppBadgesStorage storage $ = _getStorage();
        $.badgeDefinitions[badgeType] = BadgeDefinition({
            badgeType: badgeType,
            name: name,
            imageURI: imageURI,
            description: description,
            status: status
        });
        emit BadgeDefinitionUpdated(badgeType);
    }

    // ---------------- External: Badge Awarding ----------------

    /// @notice Awards the Top Ecosystem dApp badge to the top N apps from scoring rankings.
    /// Top N = ceiling(total eligible apps * 10%), as specified in the PRD.
    /// @param round The round number.
    /// @param rankedAppIds Ordered array of app IDs from XAppScoring (highest score first).
    /// @param topN Number of apps to award (already computed off-chain as ceil(10%)).
    function awardTopEcosystemDAppBadges(
        uint256 round,
        bytes32[] calldata rankedAppIds,
        uint256 topN
    ) external onlyRoleOrAdmin(BADGE_MANAGER_ROLE) {
        if (rankedAppIds.length == 0) revert EmptyArray();
        if (topN == 0) revert EmptyArray();

        uint256 count = topN > rankedAppIds.length ? rankedAppIds.length : topN;
        uint256 currentRank = 1;

        for (uint256 i = 0; i < count; i++) {
            bytes32 appId = rankedAppIds[i];
            // Tied scores get same rank; increment rank only when scores differ
            // The rank calculation is done off-chain, so we use i+1 as a simple sequential rank.
            // For true tie handling, call awardSpecificBadge with explicit ranks.
            uint256 rank = i + 1;
            _awardBadge(appId, round, BadgeType.TOP_ECOSYSTEM_DAPP, rank);
        }
    }

    /// @notice Awards the Top Distribution Performer badge to top N apps based on distribution efficiency.
    /// @param round The round number.
    /// @param rankedAppIds Ordered array of app IDs by distribution efficiency (highest first).
    /// @param topN Number of apps to award.
    function awardTopDistributionPerformerBadges(
        uint256 round,
        bytes32[] calldata rankedAppIds,
        uint256 topN
    ) external onlyRoleOrAdmin(BADGE_MANAGER_ROLE) {
        if (rankedAppIds.length == 0) revert EmptyArray();
        if (topN == 0) revert EmptyArray();

        uint256 count = topN > rankedAppIds.length ? rankedAppIds.length : topN;
        for (uint256 i = 0; i < count; i++) {
            _awardBadge(rankedAppIds[i], round, BadgeType.TOP_DISTRIBUTION_PERFORMER, i + 1);
        }
    }

    /// @notice Awards the Navigators' Pick badge to the top 3 apps selected by Navigators.
    /// @param round The round number.
    /// @param appIds Array of app IDs selected by Navigators (ordered by rank).
    function awardNavigatorsPickBadges(
        uint256 round,
        bytes32[] calldata appIds
    ) external onlyRoleOrAdmin(BADGE_MANAGER_ROLE) {
        if (appIds.length == 0) revert EmptyArray();
        for (uint256 i = 0; i < appIds.length; i++) {
            _awardBadge(appIds[i], round, BadgeType.NAVIGATORS_PICK, i + 1);
        }
    }

    /// @notice Awards a specific badge type to an app with an explicit rank.
    /// Useful for awarding individual badges or handling ties where ranks may skip.
    function awardSpecificBadge(
        bytes32 appId,
        uint256 round,
        BadgeType badgeType,
        uint256 rank
    ) external onlyRoleOrAdmin(BADGE_MANAGER_ROLE) {
        _awardBadge(appId, round, badgeType, rank);
    }

    function _awardBadge(bytes32 appId, uint256 round, BadgeType badgeType, uint256 rank) internal {
        XAppBadgesStorage storage $ = _getStorage();
        BadgeDefinition storage def = $.badgeDefinitions[badgeType];

        BadgeAward memory award = BadgeAward({
            appId: appId,
            round: round,
            badgeType: badgeType,
            rank: rank,
            timestamp: block.timestamp,
            isPrivate: def.status == BadgeStatus.UNPUBLISHED
        });

        $.appRoundBadges[appId][round].push(badgeType);
        $.appBadgeHistory[appId].push(award);

        emit BadgeAwarded(appId, round, badgeType, rank);
    }

    // ---------------- External: Privacy Toggle ----------------

    /// @notice Toggles a badge's privacy for an app. Only callable by BADGE_MANAGER_ROLE.
    /// The PRD specifies that apps can see their own badges regardless of privacy,
    /// but public users only see badges where isPrivate = false.
    function setBadgePrivacy(
        bytes32 appId,
        uint256 round,
        BadgeType badgeType,
        bool isPrivate
    ) external onlyRoleOrAdmin(BADGE_MANAGER_ROLE) {
        XAppBadgesStorage storage $ = _getStorage();
        BadgeAward[] storage history = $.appBadgeHistory[appId];
        for (uint256 i = 0; i < history.length; i++) {
            if (history[i].round == round && history[i].badgeType == badgeType) {
                history[i].isPrivate = isPrivate;
                emit BadgePrivacyUpdated(appId, round, badgeType, isPrivate);
                return;
            }
        }
    }

    // ---------------- Getters ----------------

    /// @notice Returns the definition for a badge type.
    function getBadgeDefinition(BadgeType badgeType) external view returns (BadgeDefinition memory) {
        return _getStorage().badgeDefinitions[badgeType];
    }

    /// @notice Returns all badge definitions.
    function getAllBadgeDefinitions() external view returns (
        BadgeDefinition[] memory definitions,
        BadgeType[] memory types
    ) {
        XAppBadgesStorage storage $ = _getStorage();
        definitions = new BadgeDefinition[](3);
        types = new BadgeType[](3);

        BadgeType[3] memory allTypes = [
            BadgeType.TOP_ECOSYSTEM_DAPP,
            BadgeType.TOP_DISTRIBUTION_PERFORMER,
            BadgeType.NAVIGATORS_PICK
        ];
        for (uint256 i = 0; i < 3; i++) {
            definitions[i] = $.badgeDefinitions[allTypes[i]];
            types[i] = allTypes[i];
        }
    }

    /// @notice Returns the badge types awarded to an app in a specific round.
    function getAppRoundBadges(bytes32 appId, uint256 round) external view returns (BadgeType[] memory) {
        return _getStorage().appRoundBadges[appId][round];
    }

    /// @notice Returns the full badge award history for an app.
    function getAppBadgeHistory(bytes32 appId) external view returns (BadgeAward[] memory) {
        return _getStorage().appBadgeHistory[appId];
    }

    /// @notice Returns the count of times an app has received a specific badge type in its history.
    function getAppBadgeCount(bytes32 appId, BadgeType badgeType) external view returns (uint256 count) {
        XAppBadgesStorage storage $ = _getStorage();
        BadgeAward[] storage history = $.appBadgeHistory[appId];
        for (uint256 i = 0; i < history.length; i++) {
            if (history[i].badgeType == badgeType) {
                count++;
            }
        }
    }

    /// @notice Returns the most recent round in which an app received a specific badge type.
    /// Returns 0 if the app has never received that badge type.
    function getAppLatestBadgeRound(bytes32 appId, BadgeType badgeType) external view returns (uint256 round) {
        XAppBadgesStorage storage $ = _getStorage();
        BadgeAward[] storage history = $.appBadgeHistory[appId];
        for (uint256 i = history.length; i > 0; i--) {
            if (history[i - 1].badgeType == badgeType) {
                return history[i - 1].round;
            }
        }
        return 0;
    }

    /// @notice Returns the latest awards for an app in the most recent round it received badges.
    /// Returns only public badges (non-private).
    function getLatestPublicBadges(bytes32 appId) external view returns (BadgeAward[] memory) {
        XAppBadgesStorage storage $ = _getStorage();
        BadgeAward[] storage history = $.appBadgeHistory[appId];
        if (history.length == 0) return new BadgeAward[](0);

        uint256 latestRound = history[history.length - 1].round;

        // Count badges in the latest round
        uint256 count = 0;
        for (uint256 i = history.length; i > 0; i--) {
            if (history[i - 1].round == latestRound && !history[i - 1].isPrivate) {
                count++;
            } else if (history[i - 1].round != latestRound) {
                break;
            }
        }

        BadgeAward[] memory result = new BadgeAward[](count);
        uint256 idx = 0;
        for (uint256 i = history.length; i > 0; i--) {
            if (history[i - 1].round == latestRound && !history[i - 1].isPrivate) {
                result[idx++] = history[i - 1];
            } else if (history[i - 1].round != latestRound) {
                break;
            }
        }
        return result;
    }
}
