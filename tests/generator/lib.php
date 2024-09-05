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
        $record = (object)(array)$record;

        // Ensure required fields are set.
        $record->course = isset($record->course) ? $record->course : $this->courseid;
        $record->name = isset($record->name) ? $record->name : 'Test AblePlayer';
        $record->playlist = isset($record->playlist) ? $record->playlist : 0; // Default to 0 if not provided.
        $record->mode = isset($record->mode) ? $record->mode : 'EMPTY';      // Set default mode.
        $record->lang = isset($record->lang) ? $record->lang : 'EMPTY';      // Set default language.

        // Call parent method to create the instance.
        return parent::create_instance($record, (array)$options);
    }
}
