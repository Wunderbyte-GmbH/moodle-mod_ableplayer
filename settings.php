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
 * Settings file for plugin 'media_videojs'
 *
 * @package   mod_ableplayer
 * @copyright 2024 Wunderbyte GmbH
 * @license   http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

defined('MOODLE_INTERNAL') || die();

require_once($CFG->dirroot . '/mod/ableplayer/lib.php');

$ADMIN->add(
    'modsettings',
    new admin_category('modableplayer', new lang_string('pluginname', 'mod_ableplayer'), $module->is_enabled() === false)
);

$settings = new admin_settingpage(
    $section,
    get_string('settings', 'mod_ableplayer'),
    'moodle/site:config',
    $module->is_enabled() === false,
);


if ($ADMIN->fulltree) {
        $settings->add(new admin_setting_configtext(
            'mod_ableplayer/bgcolor1',
            new lang_string('bgcolor1', 'mod_ableplayer'),
            new lang_string('bgcolor1_desc', 'mod_ableplayer'),
            '#3498db'
        ));
        $settings->add(new admin_setting_configtext(
            'mod_ableplayer/bgcolor2',
            new lang_string('bgcolor2', 'mod_ableplayer'),
            new lang_string('bgcolor2_desc', 'mod_ableplayer'),
            '#3498db'
        ));
        $settings->add(new admin_setting_configtext(
            'mod_ableplayer/bgcolor3',
            new lang_string('bgcolor3', 'mod_ableplayer'),
            new lang_string('bgcolor3_desc', 'mod_ableplayer'),
            '#3498db'
        ));
}
