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

namespace mod_ableplayer;

/**
 * Generator tests class.
 *
 * @package    mod_ableplayer
 * @copyright  2013 Frédéric Massart
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */
class generator_test extends \advanced_testcase {

    public function test_create_instance() {
        global $DB;
        $this->resetAfterTest();
        $this->setAdminUser();

        $course = $this->getDataGenerator()->create_course();

        $this->assertFalse($DB->record_exists('ableplayer', array('course' => $course->id)));
        $ableplayer = $this->getDataGenerator()->create_module('ableplayer', array('course' => $course->id));
        $this->assertEquals(1, $DB->count_records('ableplayer', array('course' => $course->id)));
        $this->assertTrue($DB->record_exists('ableplayer', array('course' => $course->id, 'id' => $ableplayer->id)));

        $params = array('course' => $course->id, 'name' => 'One more ableplayer');
        $ableplayer = $this->getDataGenerator()->create_module('ableplayer', $params);
        $this->assertEquals(2, $DB->count_records('ableplayer', array('course' => $course->id)));
        $this->assertEquals('One more ableplayer', $DB->get_field_select('ableplayer', 'name', 'id = :id', array('id' => $ableplayer->id)));
    }


}
