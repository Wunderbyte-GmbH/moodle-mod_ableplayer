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
 * @author     T6nis Tartes <tonis.tartes@gmail.com>
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

defined('MOODLE_INTERNAL') || die();

require_once($CFG->libdir . '/filelib.php');
require_once('locallib.php');

// Comment.
// Moodle core API                                                            //
// Comment.

/**
 * Returns the information on whether the module supports a feature
 *
 * @see plugin_supports() in lib/moodlelib.php
 * @param string $feature FEATURE_xx constant for requested feature
 * @return mixed true if the feature is supported, null if unknown
 */
function ableplayer_supports($feature) {
    switch ($feature) {
        case FEATURE_MOD_INTRO:
            return true;
        case FEATURE_GROUPS:
            return false;
        case FEATURE_GROUPINGS:
            return false;
        case FEATURE_COMPLETION_TRACKS_VIEWS:
            return true;
        case FEATURE_GRADE_HAS_GRADE:
            return false;
        case FEATURE_GRADE_OUTCOMES:
            return false;
        case FEATURE_BACKUP_MOODLE2:
            return true;
        case FEATURE_SHOW_DESCRIPTION:
            return true;
        default:
            return null;
    }
}

/**
 * Saves a new instance of the ableplayer into the database.
 *
 * Given an object containing all the necessary data,
 * (defined by the form in mod_form.php) this function
 * will create a new instance and return the id number
 * of the new instance.
 *
 * @param stdClass $data An object from the form in mod_form.php.
 * @param mod_ableplayer_mod_form|null $mform Optional form object.
 * @return int The id of the newly inserted ableplayer record.
 */
function ableplayer_add_instance(stdClass $data, $mform = null) {
    require_once(dirname(__FILE__) . '/locallib.php');

    if ($mform !== null && !($mform instanceof mod_ableplayer_mod_form)) {
        throw new InvalidArgumentException('The second parameter must be an instance of mod_ableplayer_mod_form or null.');
    }

    $context = context_module::instance($data->coursemodule);
    $ableplayer = new ableplayer($context, null, null);
    return $ableplayer->add_instance($data);
}


/**
 * Updates an instance of the ableplayer in the database.
 *
 * Given an object containing all the necessary data,
 * (defined by the form in mod_form.php) this function
 * will update an existing instance with new data.
 *
 * @param stdClass $data An object from the form in mod_form.php.
 * @param mod_ableplayer_mod_form|null $mform Optional form object.
 * @return boolean Success/Fail.
 */
function ableplayer_update_instance(stdClass $data, $mform = null) {
    require_once(dirname(__FILE__) . '/locallib.php');

    if ($mform !== null && !($mform instanceof mod_ableplayer_mod_form)) {
        throw new InvalidArgumentException('The second parameter must be an instance of mod_ableplayer_mod_form or null.');
    }

    $context = context_module::instance($data->coursemodule);
    $ableplayer = new ableplayer($context, null, null);
    return $ableplayer->update_instance($data);
}

/**
 * Removes an instance of the ableplayer from the database
 *
 * Given an ID of an instance of this module,
 * this function will permanently delete the instance
 * and any data that depends on it.
 *
 * @param int $id Id of the module instance
 * @return boolean Success/Failure
 */
function ableplayer_delete_instance($id) {
    require_once(dirname(__FILE__) . '/locallib.php');

    $cm = get_coursemodule_from_instance('ableplayer', $id, 0, false, MUST_EXIST);
    $context = context_module::instance($cm->id);
    $ableplayer = new ableplayer($context, null, null);
    return $ableplayer->delete_instance();
}

/**
 * Returns a small object with summary information about what a
 * user has done with a given particular instance of this module
 * Used for user activity reports.
 * $return->time = the time they did it
 * $return->info = a short text description
 *
 * Provides a summary of the user's interaction with the AblePlayer module.
 *
 * @param stdClass $course The course object containing the AblePlayer module.
 * @param stdClass $user The user object whose activity is being summarized.
 * @param stdClass $mod The module object that represents the AblePlayer instance in the course.
 * @param ableplayer $ableplayer The AblePlayer instance object.
 * @return stdClass|null A summary object containing the time of the last view and the number of views,
 *                       or null if no views were recorded.
 */
function ableplayer_user_outline($course, $user, $mod, $ableplayer) {
    global $DB;
    $logs = $DB->get_records(
        'log',
        ['userid' => $user->id,
            'module' => 'ableplayer',
            'action' => 'view',
            'info' => $ableplayer->id]
    );
        'time ASC';
    if ($logs) {
        $numviews = count($logs);
        $lastlog = array_pop($logs);
        $result = new stdClass();
        $result->time = $lastlog->time;
        $result->info = get_string('numviews', '', $numviews);
        return $result;
    }
    return null;
}

/**
 * Prints a detailed representation of what a user has done with
 * a given particular instance of this module, for user activity reports.
 *
 * @param stdClass $course the current course record
 * @param stdClass $user the record of the user we are generating report for
 * @param cm_info $mod course module info
 * @param ableplayer $ableplayer the module instance record
 * @return void, is supposed to echp directly
 */
function ableplayer_user_complete($course, $user, $mod, $ableplayer) {
    global $DB;
    $logs = $DB->get_records(
        'log',
        ['userid' => $user->id,
            'module' => 'ableplayer',
            'action' => 'view',
            'info' => $ableplayer->id],
        'time ASC'
    );
    if ($logs) {
        $numviews = count($logs);
        $lastlog = array_pop($logs);
        $strmostrecently = get_string('mostrecently');
        $strnumviews = get_string('numviews', '', $numviews);
        echo "$strnumviews - $strmostrecently " . userdate($lastlog->time);
    } else {
        print_string('neverseen', 'ableplayer');
    }
}

/**
 * Given a course and a time, this module should find recent activity
 * that has occurred in ableplayer activities and print it out.
 * Return true if there was output, or false is there was none.
 * @param stdClass $course
 * @param stdClass $viewfullnames
 * @param int $timestart
 * @return boolean
 */
function ableplayer_print_recent_activity(stdClass $course, stdClass $viewfullnames, int $timestart) {
    return false;  // True if anything was printed, otherwise false.
}

/**
 * Prepares the recent activity data
 *
 * This callback function is supposed to populate the passed array with
 * custom activity records. These records are then rendered into HTML via
 * ableplayer_print_recent_mod_activity.
 *
 * @param array $activities sequentially indexed array of objects with the 'cmid' property
 * @param int $index the index in the $activities to use for the next record
 * @param int $timestart append activity since this time
 * @param int $courseid the id of the course we produce the report for
 * @param int $cmid course module id
 * @param int $userid check for a particular user's activity only, defaults to 0 (all users)
 * @param int $groupid check for a particular group's activity only, defaults to 0 (all groups)
 * @return void adds items into $activities and increases $index
 */
function ableplayer_get_recent_mod_activity(array &$activities, int &$index, int $timestart, int $courseid, int $cmid, int $userid = 0, int $groupid = 0) {
}

/**
 * Prints single activity item prepared by {@see ableplayer_get_recent_mod_activity()}
 * @param array $activities sequentially indexed array of objects with the 'cmid' property
 * @param int $courseid the id of the course we produce the report for
 * @param stdClass $detail
 * @param stdClass $modnames
 * @param stdClass $viewfullnames
 * @return void
 */
function ableplayer_print_recent_mod_activity(array $activity, int $courseid, stdClass $detail, stdClass $modnames, stdClass $viewfullnames) {
}

/**
 * Function to be run periodically according to the moodle cron
 * This function searches for things that need to be done, such
 * as sending out mail, toggling flags etc ...
 *
 * @return boolean
 **/
function ableplayer_cron() {
    return false;
}

/**
 * Returns all other caps used in the module
 *
 * @return array
 */
function ableplayer_get_extra_capabilities() {
    return [];
}

//
// Gradebook API                                                              //
// .

/**
 * Is a given scale used by the instance of ableplayer?
 *
 * This function returns if a scale is being used by one ableplayer
 * if it has support for grading and scales. Commented code should be
 * modified if necessary. See forum, glossary or journal modules
 * as reference.
 *
 * @param int $ableplayerid ID of an instance of this module
 * @param int $scaleid
 * @return bool true if the scale is used by the given ableplayer instance
 */
function ableplayer_scale_used(int $ableplayerid, int $scaleid) {
    return false;
}

/**
 * Checks if scale is being used by any instance of ableplayer.
 *
 * This is used to find out if scale used anywhere.
 *
 * @param int $scaleid int
 * @return boolean true if the scale is used by any ableplayer instance
 */
function ableplayer_scale_used_anywhere($scaleid) {
    return false;
}

/**
 * Creates or updates grade item for the give ableplayer instance
 *
 * Needed by grade_update_mod_grades() in lib/gradelib.php
 *
 * @param ableplayer $ableplayer instance object with extra cmidnumber and modname property
 * @return bool
 */
function ableplayer_grade_item_update(stdClass $ableplayer) {
    return false;
}

/**
 * Update ableplayer grades in the gradebook
 *
 * Needed by grade_update_mod_grades() in lib/gradelib.php
 *
 * @param ableplayer $ableplayer instance object with extra cmidnumber and modname property
 * @param int $userid update grade of specific user only, 0 means all participants
 * @return bool
 */
function ableplayer_update_grades(stdClass $ableplayer, $userid = 0) {
    return false;
}

//
// File API                                                                   //
// .

/**
 * Returns the lists of all browsable file areas within the given module context
 *
 * The file area 'intro' for the activity introduction field is added automatically
 * by file_browser::get_file_info_context_module
 *
 * @param stdClass $course
 * @param stdClass $cm
 * @param stdClass $context
 * @return array of [(string)filearea] => (string)description
 */
function ableplayer_get_file_areas($course, $cm, $context) {
    return [
        'media' => get_string('filearea_medias', 'ableplayer'),
        'desc' => get_string('filearea_descs', 'ableplayer'),
        'poster' => get_string('filearea_posters', 'ableplayer'),
        'caption' => get_string('filearea_captions', 'ableplayer'),
    ];
}

/**
 * File browsing support for ableplayer file areas
 *
 * @package mod_ableplayer
 * @category files
 *
 * @param file_browser $browser
 * @param array $areas
 * @param stdClass $course
 * @param stdClass $cm
 * @param stdClass $context
 * @param string $filearea
 * @param int $itemid
 * @param string $filepath
 * @param string $filename
 * @return file_info instance or null if not found
 */
function ableplayer_get_file_info($browser, $areas, $course, $cm, $context, $filearea, $itemid, $filepath, $filename) {
    global $CFG;
    if ($context->contextlevel != CONTEXT_MODULE) {
        return null;
    }
    // Filearea must contain a real area.
    if (!isset($areas[$filearea])) {
        return null;
    }
    if (!has_capability('moodle/course:managefiles', $context)) {
        // Students can not peek here!
        return null;
    }
    $fs = get_file_storage();
    if ($filearea === 'media' || $filearea === 'poster' || $filearea === 'caption' || $filearea === 'desc') {
        $filepath = is_null($filepath) ? '/' : $filepath;
        $filename = is_null($filename) ? '.' : $filename;
        if (
            !$storedfile = $fs->get_file(
                $context->id,
                'mod_ableplayer',
                $filearea,
                0,
                $filepath,
                $filename
            )
        ) {
            // Not found.
            return null;
        }
        $urlbase = $CFG->wwwroot . '/pluginfile.php';
        return new file_info_stored(
            $browser,
            $context,
            $storedfile,
            $urlbase,
            $areas[$filearea],
            false,
            true,
            true,
            false
        );
    }
    // Not found.
    return null;
}

/**
 * Serves the files from the ableplayer file areas
 *
 * @package mod_ableplayer
 * @category files
 *
 * @param stdClass $course the course object
 * @param stdClass $cm the course module object
 * @param stdClass $context the ableplayer's context
 * @param string $filearea the name of the file area
 * @param array $args extra arguments (itemid, path)
 * @param bool $forcedownload whether or not force download
 * @param array $options additional options affecting the file serving
 */
function ableplayer_pluginfile($course, $cm, $context, $filearea, array $args, $forcedownload, array $options = []) {
    global $CFG, $DB, $USER;
    require_once(dirname(__FILE__) . '/locallib.php');
    if ($context->contextlevel != CONTEXT_MODULE) {
        return false;
    }
    require_login($course, true, $cm);

    if ($filearea !== 'media' && $filearea !== 'poster' && $filearea !== 'caption' && $filearea !== 'desc') {
        // Intro is handled automatically in pluginfile.php.
        return false;
    }
    $fs = get_file_storage();
    $relativepath = implode('/', $args);
    $fullpath = rtrim('/' . $context->id . '/mod_ableplayer/' . $filearea . '/' .
        $relativepath, '/');
    $file = $fs->get_file_by_hash(sha1($fullpath));
    if (!$file || $file->is_directory()) {
        return false;
    }
    // Default cache lifetime is 86400s.
    send_stored_file($file);
}

/**
 * File browsing support class
 */
class ableplayer_content_file_info extends file_info_stored {
    /**
     * Gets the parent file info.
     *
     * @return file_info|null Parent file info or null if not found.
     */
    public function get_parent() {
        if ($this->lf->get_filepath() === '/' && $this->lf->get_filename() === '.') {
            return $this->browser->get_file_info($this->context);
        }
        return parent::get_parent();
    }

    /**
     * Gets the visible name of the file.
     *
     * @return string Visible name of the file.
     */
    public function get_visible_name() {
        if ($this->lf->get_filepath() === '/' && $this->lf->get_filename() === '.') {
            return $this->topvisiblename;
        }
        return parent::get_visible_name();
    }
}

/**
 * This function is used by the reset_course_userdata function in moodlelib.
 *
 * @param stdClass $data The data submitted from the reset course.
 * @return array Status array
 */
function ableplayer_reset_userdata(stdClass $data) {
    return [];
}

//
// Navigation API                                                             //
// .

/**
 * Extends the global navigation tree by adding ableplayer nodes if there is a relevant content
 *
 * This can be called by an AJAX request so do not rely on $PAGE as it might not be set up properly.
 *
 * @param navigation_node $navref An object representing the navigation tree node of the ableplayer module instance
 * @param stdClass $course
 * @param stdClass $module
 * @param cm_info $cm
 */
function ableplayer_extend_navigation(navigation_node $navref, stdclass $course, stdclass $module, cm_info $cm) {
}

/**
 * Extends the settings navigation with the ableplayer settings
 *
 * This function is called when the context for the page is a ableplayer module. This is not called by AJAX
 * so it is safe to rely on the $PAGE.
 *
 * @param settings_navigation $settingsnav settings_navigation
 * @param navigation_node|null $ableplayernode navigation_node
 */
function ableplayer_extend_settings_navigation(settings_navigation $settingsnav, $ableplayernode = null) {
}
