<?php
// This file is part of Moodle - http://moodle.org/
//
// Moodle is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
//
// Moodle is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.
//
// You should have received a copy of the GNU General Public License
// along with Moodle.  If not, see <http://www.gnu.org/licenses/>.

/**
 * This class contains a list of webservice functions related to the ableplayer Module by Wunderbyte.
 *
 * @copyright  2024 Wunderbyte GmbH
 * @package    mod_ableplayer
 * @author     Georg Maißer <info@wunderbyte.at>
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

namespace mod_ableplayer\privacy;

use core_privacy\local\metadata\collection;
use core_privacy\local\request\approved_contextlist;
use core_privacy\local\request\approved_userlist;
use core_privacy\local\request\contextlist;
use core_privacy\local\request\userlist;
use core_privacy\local\request\writer;
use context;

/**
 * Privacy provider implementation for mod_ableplayer.
 */
class provider implements
    \core_privacy\local\metadata\provider,
    \core_privacy\local\request\plugin\provider {
    /**
     * Returns metadata about this plugin's data collection.
     *
     * @param collection $collection The collection to add metadata to.
     * @return collection A listing of user data stored through this system.
     */
    public static function get_metadata(collection $collection): collection {
        // The ableplayer table stores information about the activity instance.
        $collection->add_database_table(
            'ableplayer',
            [
                'course' => 'privacy:metadata:ableplayer:course',
                'name' => 'privacy:metadata:ableplayer:name',
                'intro' => 'privacy:metadata:ableplayer:intro',
                'introformat' => 'privacy:metadata:ableplayer:introformat',
                'playlist' => 'privacy:metadata:ableplayer:playlist',
                'mode' => 'privacy:metadata:ableplayer:mode',
                'lang' => 'privacy:metadata:ableplayer:lang',
                'timecreated' => 'privacy:metadata:ableplayer:timecreated',
                'timemodified' => 'privacy:metadata:ableplayer:timemodified'
            ],
            'privacy:metadata:ableplayer'
        );

        // The ableplayer_media table stores media files linked to the activity.
        $collection->add_database_table(
            'ableplayer_media',
            [
                'ableplayerid' => 'privacy:metadata:ableplayer_media:ableplayerid',
                'url' => 'privacy:metadata:ableplayer_media:url'
            ],
            'privacy:metadata:ableplayer_media'
        );

        // The ableplayer_desc table stores description files.
        $collection->add_database_table(
            'ableplayer_desc',
            [
                'ableplayerid' => 'privacy:metadata:ableplayer_desc:ableplayerid'
            ],
            'privacy:metadata:ableplayer_desc'
        );

        // The ableplayer_caption table stores captions for the activity.
        $collection->add_database_table(
            'ableplayer_caption',
            [
                'ableplayerid' => 'privacy:metadata:ableplayer_caption:ableplayerid',
                'label' => 'privacy:metadata:ableplayer_caption:label',
                'kind' => 'privacy:metadata:ableplayer_caption:kind',
                'srclang' => 'privacy:metadata:ableplayer_caption:srclang'
            ],
            'privacy:metadata:ableplayer_caption'
        );

        return $collection;
    }

    /**
     * Returns the list of contexts that contain user information for the specified user.
     *
     * @param int $userid The user ID.
     */
    public static function get_contexts_for_userid(int $userid): contextlist {
        // This plugin does not store any user-specific data, so no contexts are returned.

        return new contextlist();
    }

    /**
     * Export all user data for the specified approved contexts.
     *
     * @param approved_contextlist $contextlist The approved contextlist.
     */
    public static function export_user_data(approved_contextlist $contextlist) {
        // This plugin does not store any user-specific data to export.
    }

    /**
     * Deletes all data for all users in the specified context.
     *
     * @param context $context The context to delete data for.
     */
    public static function delete_data_for_all_users_in_context(context $context) {
        // This plugin does not store any user-specific data to delete.
    }

    /**
     * Deletes all user data for the specified user and context.
     *
     * @param approved_contextlist $contextlist The approved contextlist.
     */
    public static function delete_data_for_user(approved_contextlist $contextlist) {
        // This plugin does not store any user-specific data to delete.
    }

    /**
     * Get the list of users who have data within a given context.
     *
     * @param userlist $userlist The userlist to add the user information to.
     */
    public static function get_users_in_context(userlist $userlist) {
        // This plugin does not store any user-specific data related to users.
    }

    /**
     * Deletes data for multiple users within a single context.
     *
     * @param approved_userlist $userlist The approved userlist.
     */
    public static function delete_data_for_users(approved_userlist $userlist) {
        // This plugin does not store any user-specific data to delete.
    }
}
