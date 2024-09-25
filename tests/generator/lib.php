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
 * mod_ableplayer data generator.
 *
 * @package    mod_ableplayer
 * @category   test
 * @copyright  2013 Frédéric Massart
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

defined('MOODLE_INTERNAL') || die();

/**
 * mod_ableplayer data generator class.
 *
 * @package    mod_ableplayer
 * @category   test
 * @copyright  2013 Frédéric Massart
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */
class mod_ableplayer_generator extends testing_module_generator {
    /**
     * @var int keep track of how many messages have been created.
     */
    protected $messagecount = 0;

    /**
     * To be called from data reset code only,
     * do not use in tests.
     * @return void
     */
    public function reset() {
        $this->messagecount = 0;
        parent::reset();
    }

    /**
     * Create an instance of the ableplayer activity.
     * @param stdClass|null $record
     * @param array|null $options
     * @return stdClass
     */
    public function create_instance($record = null, array $options = null) {
        global $CFG;
        $record = (object)(array)$record;

        // Ensure required fields are set.
        $record->course = isset($record->course) ? $record->course : $this->courseid;
        $record->name = isset($record->name) ? $record->name : 'Test AblePlayer';
        $record->playlist = isset($record->playlist) ? $record->playlist : 0; // Default to 0 if not provided.
        $record->mode = isset($record->mode) ? $record->mode : 'EMPTY';      // Set default mode.
        $record->lang = isset($record->lang) ? $record->lang : 'EMPTY';      // Set default language.

       // Create the basic instance (without the file).
        $instance = parent::create_instance($record, (array)$options);

       // Check if a media file path is provided in the options.
        if (isset($options['media file'])) {
            $mediafilepath = '/mod/ableplayer/tests/fixtures/deadline.mp4';
            $this->add_file_to_instance($instance->id, $mediafilepath);
        }
        // Check if a description file path is provided in the options.
        if (isset($options['captions'])) {
            $captionsfilepath = '/mod/ableplayer/tests/fixtures/sample_description.vtt';
            $this->add_file_to_instance($instance->id, $captionsfilepath);
        }

        return $instance;
    }
    /**
     * Add file to the ableplayer instance.
     * @param int $instanceid
     * @param string $filepath
     */
    protected function add_file_to_instance($instanceid, $filepath, $filearea) {
        global $DB, $CFG;

        // Prepare the file record object.
        $fs = get_file_storage();
        $context = context_module::instance($instanceid);

        $filerecord = array(
            'contextid' => $context->id,
            'component' => 'ableplayer',  // Your activity module name.
            'filearea'  => $fielarea,          // File area defined in your plugin.
            'itemid'    => 0,
            'filepath'  => '/',
            'filename'  => basename($filepath)
        );

        // Get the file from fixtures and add it to the activity.
        $fullpath = $CFG->dirroot . $filepath;
        $fs->create_file_from_pathname($filerecord, $fullpath);
    }
}
