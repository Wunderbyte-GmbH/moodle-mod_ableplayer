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
 * @author     Tõnis Tartes <tonis.tartes@gmail.com>
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

defined('MOODLE_INTERNAL') || die();

global $DB;

$logs = [
    ['module' => 'ableplayer', 'action' => 'add', 'mtable' => 'ableplayer', 'field' => 'name'],
    ['module' => 'ableplayer', 'action' => 'update', 'mtable' => 'ableplayer', 'field' => 'name'],
    ['module' => 'ableplayer', 'action' => 'view', 'mtable' => 'ableplayer', 'field' => 'name'],
    ['module' => 'ableplayer', 'action' => 'view all', 'mtable' => 'ableplayer', 'field' => 'name'],
];
