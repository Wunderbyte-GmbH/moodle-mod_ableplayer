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
 * Entities Class to display list of entity records.
 *
 * @package     mod_ableplayer
 * @copyright  2023 Wunderbyte GmbH
 * @license http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

/**
 * Define the complete ableplayer structure for backup, with file and id annotations
 */
class backup_ableplayer_activity_structure_step extends backup_activity_structure_step {

    /**
     * Define each element separated.
     * @return array
     */
    protected function define_structure() {
        $nodes = [
            'name', 'intro', 'introformat', 'playlist',
            'mode', 'lang', 'timecreated', 'timemodified'
        ];
        $ableplayer = new backup_nested_element('ableplayer', ['id'], $nodes);

        $medias = new backup_nested_element('medias');
        $media = new backup_nested_element('media', ['id'],
        ['ableplayerid']);

        $descs = new backup_nested_element('descs');
        $desc = new backup_nested_element('desc', ['id'],
        ['ableplayerid']);

        $captions = new backup_nested_element('captions');
        $caption = new backup_nested_element('caption', ['id'],
          ['ableplayerid', 'label', 'kind', 'srclang']);

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
