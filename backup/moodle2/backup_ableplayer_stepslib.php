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
 * @author     T6nis Tartes <tonis.tartes@gmail.com>
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

namespace mod_ableplayer\backup;

use backup_activity_structure_step;
use backup_nested_element;
use backup;

/**
 * Define the complete ableplayer structure for backup, with file and id annotations
 */
class backup_ableplayer_activity_structure_step extends backup_activity_structure_step {
    /**
     * Defines the complete backup structure for the AblePlayer activity module,
     * including file and ID annotations.
     *
     * This function specifies the data structure for backing up an AblePlayer activity.
     * It includes the main AblePlayer activity settings, media files, descriptions, and
     * captions. Each of these components is structured hierarchically to ensure a
     * comprehensive backup.
     *
     * The function defines:
     * - The root element 'ableplayer' containing its settings and child elements.
     * - Child elements 'medias', 'descs', and 'captions' with their respective data.
     * - The data sources for each element, mapping to the appropriate database tables.
     * - File annotations for different areas (intro, poster, media, description, caption)
     *   to include files associated with the AblePlayer activity in the backup.
     *
     * @return backup_structure The complete backup structure for the AblePlayer activity module.
     */
    protected function define_structure() {

        // To know if we are including userinfo
        // ableplayer user data is in the xmldata field in DB - anyway lets skip that.

        // Define each element separated.
        $ableplayer = new backup_nested_element('ableplayer', ['id'], [
            'name', 'intro', 'introformat', 'playlist',
            'mode', 'lang', 'timecreated', 'timemodified']);

        $medias = new backup_nested_element('medias');
        $media = new backup_nested_element('media', ['id'], [
            'ableplayerid']);

        $descs = new backup_nested_element('descs');
        $desc = new backup_nested_element('desc', ['id'], [
            'ableplayerid']);

        $captions = new backup_nested_element('captions');
        $caption = new backup_nested_element('caption', ['id'], [
            'ableplayerid', 'label', 'kind', 'srclang']);

        // Build the tree.
        $ableplayer->add_child($medias);
        $medias->add_child($media);

        $ableplayer->add_child($descs);
        $descs->add_child($desc);

        $ableplayer->add_child($captions);
        $captions->add_child($caption);

        // Define sources.
        $ableplayer->set_source_table('ableplayer', ['id' => backup::VAR_ACTIVITYID]);
        $media->set_source_table('ableplayer_media', ['ableplayerid' => backup::VAR_PARENTID], 'id ASC');
        $desc->set_source_table('ableplayer_desc', ['ableplayerid' => backup::VAR_PARENTID], 'id ASC');
        $caption->set_source_table('ableplayer_caption', ['ableplayerid' => backup::VAR_PARENTID], 'id ASC');
        // Define id annotations.

        // Define file annotations.
        $ableplayer->annotate_files('mod_ableplayer', 'intro', null);
        $ableplayer->annotate_files('mod_ableplayer', 'poster', null);
        $ableplayer->annotate_files('mod_ableplayer', 'media', 'id');
        $ableplayer->annotate_files('mod_ableplayer', 'desc', 'id');
        $ableplayer->annotate_files('mod_ableplayer', 'caption', 'id');

        // Return the root element (ableplayer), wrapped into standard activity structure.
        return $this->prepare_activity_structure($ableplayer);
    }
}
