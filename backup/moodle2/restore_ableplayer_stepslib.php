<?php
// This file is part of ableplayer module for Moodle - http://moodle.org/
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
 * @author     Tõnis Tartes <tonis.tartes@gmail.com>
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

namespace mod_ableplayer\backup;

use restore_activity_structure_step;
use restore_path_element;


/**
 * Structure step to restore one ableplayer activity
 */
class restore_ableplayer_activity_structure_step extends restore_activity_structure_step {
    /**
     * Defines the restore structure for the AblePlayer activity module.
     * These paths are then wrapped into the standard activity structure for the
     * Moodle restore process.
     *
     * @return restore_structure_step The complete restore structure for the AblePlayer activity module.
     */
    protected function define_structure() {

        $paths = [];
        $paths[] = new restore_path_element('ableplayer', '/activity/ableplayer');
        $paths[] = new restore_path_element('ableplayer_media', '/activity/ableplayer/medias/media');
        $paths[] = new restore_path_element('ableplayer_desc', '/activity/ableplayer/descs/desc');
        $paths[] = new restore_path_element('ableplayer_caption', '/activity/ableplayer/captions/caption');
        // Return the paths wrapped into standard activity structure.
        return $this->prepare_activity_structure($paths);
    }
    /**
     * Processes the AblePlayer data during the restore process.
     *
     * This function takes the AblePlayer data from the restore process, adjusts the
     * course ID and date fields to align with the current restore context, and inserts
     * the data into the 'ableplayer' table in the database. After the insertion, it maps
     * the newly created activity instance to ensure proper referencing in the restored course.
     *
     * @param array $data The data array containing AblePlayer activity information
     *                    from the restore file, which includes course ID, time created,
     *                    time modified, and other necessary fields.
     * @return void
     */
    protected function process_ableplayer($data) {
        global $DB;

        $data = (object)$data;
        $data->course = $this->get_courseid();
        $data->timecreated = $this->apply_date_offset($data->timecreated);
        $data->timemodified = $this->apply_date_offset($data->timemodified);

        $newitemid = $DB->insert_record('ableplayer', $data);
        $this->apply_activity_instance($newitemid);
    }
    /**
     * Processes AblePlayer media data during the restore process.
     *
     * This function takes media data related to the AblePlayer activity from the
     * restore process, updates the parent AblePlayer ID to match the newly restored
     * instance, inserts the media data into the 'ableplayer_media' table in the
     * database, and sets up the necessary mapping for the restored media item.
     *
     * @param array $data The data array containing media information from the
     *                    restore file, which includes the media ID, related AblePlayer
     *                    activity ID, and other necessary fields.
     *
     * @return void
     */
    protected function process_ableplayer_media($data) {
        global $DB;

        $data = (object)$data;
        $oldid = $data->id;
        $data->ableplayerid = $this->get_new_parentid('ableplayer');

        $newitemid = $DB->insert_record('ableplayer_media', $data);
        $this->set_mapping('ableplayer_media', $oldid, $newitemid, true);
    }
    /**
     * Processes AblePlayer description data during the restore process.
     *
     * This function is responsible for handling description data related to the
     * AblePlayer activity during the restoration of a course backup. It updates
     * the parent AblePlayer ID to reflect the new restored instance, inserts the
     * description data into the 'ableplayer_desc' table in the database, and
     * creates a mapping for the restored description item.
     *
     * @param array $data The data array containing description information from
     *                    the restore file. This includes the description ID,
     *                    related AblePlayer activity ID, and other relevant fields.
     *
     * @return void
     */
    protected function process_ableplayer_desc($data) {
        global $DB;

        $data = (object)$data;
        $oldid = $data->id;

        $data->ableplayerid = $this->get_new_parentid('ableplayer');

        $newitemid = $DB->insert_record('ableplayer_desc', $data);
        $this->set_mapping('ableplayer_desc', $oldid, $newitemid, true);
    }
    /**
     * Processes AblePlayer caption data during the restore process.
     *
     * This function handles the restoration of caption data associated with
     * the AblePlayer activity. It updates the parent AblePlayer ID to match
     * the newly restored instance, inserts the caption data into the
     * 'ableplayer_caption' table in the database, and creates a mapping
     * for the restored caption item.
     *
     * @param array $data The data array containing caption information from
     *                    the restore file, including the caption ID,
     *                    related AblePlayer activity ID, and other caption details.
     *
     * @return void
     */
    protected function process_ableplayer_caption($data) {
        global $DB;

        $data = (object)$data;
        $oldid = $data->id;
        $data->ableplayerid = $this->get_new_parentid('ableplayer');

        $newitemid = $DB->insert_record('ableplayer_caption', $data);
        $this->set_mapping('ableplayer_caption', $oldid, $newitemid, true);
    }
    /**
     * Finalize the restore process by adding related files for the AblePlayer activity.
     *
     * This function is called after the main restore process is completed. It handles the
     * restoration of related files associated with the AblePlayer activity, including the
     * intro, poster, media, description, and caption files. The files are added to the
     * appropriate file areas within the restored context.
     *
     * The related files are added without requiring a match by item name, as the context
     * is handled internally by the Moodle restore system.
     *
     * @return void
     */
    protected function after_execute() {
        // Add ableplayer related files, no need to match by itemname (just internally handled context).
        $this->add_related_files('mod_ableplayer', 'intro', null);
        $this->add_related_files('mod_ableplayer', 'poster', null);
        $this->add_related_files('mod_ableplayer', 'media', 'ableplayer_media');
        $this->add_related_files('mod_ableplayer', 'desc', 'ableplayer_desc');
        $this->add_related_files('mod_ableplayer', 'caption', 'ableplayer_caption');
    }
}
