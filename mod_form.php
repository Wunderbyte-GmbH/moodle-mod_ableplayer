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
 * The main ableplayer configuration form
 *
 * It uses the standard core Moodle formslib. For more info about them, please
 * visit: http://docs.moodle.org/en/Development:lib/formslib.php
 * @copyright  2024 Wunderbyte GmbH
 * @package    mod_ableplayer
 * @author     T6nis Tartes <tonis.tartes@gmail.com>
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

defined('MOODLE_INTERNAL') || die();

require_once($CFG->dirroot . '/course/moodleform_mod.php');

/**
 * Module instance settings form
 */
class mod_ableplayer_mod_form extends moodleform_mod {
    /**
     * Defines forms elements
     */
    public function definition() {
        global $CFG, $DB;

        $mform = $this->_form;
        // -------------------------------------------------------------------------------
        // Adding the "general" fieldset, where all the common settings are showed.
        $mform->addElement('header', 'general', get_string('general', 'form'));

        // Adding the standard "name" field.
        $mform->addElement('text', 'name', get_string('ableplayername', 'ableplayer'), ['size' => '64']);
        $mform->setType('name', PARAM_TEXT);
        $mform->addRule('name', null, 'required', null, 'client');
        $mform->addRule('name', get_string('maximumchars', '', 255), 'maxlength', 255, 'client');
        $mform->addHelpButton('name', 'ableplayername', 'ableplayer');

        // Adding the standard "intro" and "introformat" fields.
        $this->standard_intro_elements();

        // ...
        // --------------------------------------- MEDIA SOURCE ----------------------------------------
        $mform->addElement('header', 'ableplayergeneral', get_string('ableplayergeneral', 'ableplayer'));

        // Poster file manager.
        $options = ['subdirs' => false,
            'maxbytes' => 0,
            'maxfiles' => 1,
            'accepted_types' => ['image']];
        $mform->addElement(
            'filemanager',
            'poster',
            get_string('poster', 'ableplayer'),
            null,
            $options
        );
        $mform->addHelpButton('poster', 'poster', 'ableplayer');

        // Is this playlist?
        $playlistarray = [
            0 => 'No',
            1 => 'Yes',
        ];
        $mform->addElement('select', 'playlist', get_string('playlist', 'ableplayer'), $playlistarray);

        // Mode.
        $modearray = [
            '' => '',
            'playsinline' => get_string('playsinline', 'ableplayer'),
            'data-lyrics-mode' => get_string('lyricsmode', 'ableplayer'),
        ];
        $mform->addElement('select', 'mode', get_string('mode', 'ableplayer'), $modearray);

        $langarray = [
            'en' => 'en',
            'ca' => 'ca',
            'de' => 'de',
            'es' => 'es',
            'fr' => 'fr',
            'it' => 'it',
            'ja' => 'ja',
            'nb' => 'nb',
            'nl' => 'nl',
        ];
        $mform->addElement('select', 'lang', get_string('lang', 'ableplayer'), $langarray);

        $repeatarray = [];

        // Media files & description files
        $mform->addElement('header', 'ableplayermedia', get_string('ableplayermedia', 'ableplayer'));
        $repeatarray[] = $mform->createElement('text', 'url', get_string('ableplayermediaurl', 'ableplayer'));
        $mform->setType('url', PARAM_URL);
        $repeatarray[] = $mform->createElement('hidden', 'mediaurlid', 0);

        $options = ['subdirs' => false,
            'maxbytes' => 0,
            'maxfiles' => 1,
            'accepted_types' => array('.mp4', '.webm', '.webv', '.ogg', '.ogv', '.oga', '.wav', '.mp3'));

        $repeatarray[] = $mform->createElement(
            'filemanager',
            'media',
            get_string('ableplayermedia', 'ableplayer'),
            null,
            $options
        );
        $repeatarray[] = $mform->createElement('hidden', 'mediaid', 0);

        $repeatarray[] = $mform->createElement(
            'filemanager',
            'desc',
            get_string('ableplayerdescriptionfile', 'ableplayer'),
            null,
            $options
        );
        $repeatarray[] = $mform->createElement('hidden', 'descid', 0);

        if ($this->_instance){
            $repeatno = $DB->count_records('ableplayer_media', array('ableplayerid'=>$this->_instance));
        }
        $repeatno = !empty($repeatno) ? $repeatno : 1;

        $repeateloptions = array();
        $mform->setType('mediaurlid', PARAM_INT);
        $mform->setType('mediaid', PARAM_INT);
        $mform->setType('descid', PARAM_INT);
        $mform->setType('url', PARAM_URL);

        // Repeat the elements without repeating the header
        $this->repeat_elements(
            $repeatarray,           // The elements to be repeated
            $repeatno,              // Number of repetitions
            $repeateloptions,                // Repeat element options (empty if not needed)
            'ableplayermedias_repeats', // Element name prefix for repeated elements
            'ableplayermedias_add_fields', // Field name for "Add more" button
            1,                      // Number of blank fields to allow for extra entries
            null,                   // Add button options
            true                    // Allow deletion of repeated elements
        );


        // Captions
        $mform->addElement('header', 'ableplayercaptions', get_string('ableplayercaptions', 'ableplayer'));
        $repeatarray = array();
        $options = array('subdirs' => false,
            'maxbytes' => 0,
            'maxfiles' => 1,
            'accepted_types' => array('.vtt'));
        $repeatarray[] = $mform->createElement(
            'filemanager',
            'caption',
            get_string('captions', 'ableplayer'),
            null,
            $options
        );

        $kindarray = [
            '' => '',
            'captions' => 'captions',
            'subtitles' => 'subtitles',
            'descriptions' => 'descriptions',
            'chapters' => 'chapters',
        ];
        $repeatarray[] = $mform->createElement('select', 'kind', get_string('kind', 'ableplayer'), $kindarray);

        // Lang array based on /translations folder files.
        $langarray = [
            '' => '',
            'en' => 'en',
            'ca' => 'ca',
            'de' => 'de',
            'es' => 'es',
            'fr' => 'fr',
            'it' => 'it',
            'ja' => 'ja',
            'nb' => 'nb',
            'nl' => 'nl',
        );
        $repeatarray[] = $mform->createElement('select', 'srclang', get_string('srclang', 'ableplayer'), $langarray);

        $repeatarray[] = $mform->createElement('text', 'label', get_string('label', 'ableplayer'));
        $repeatarray[] = $mform->createElement('hidden', 'captionid', 0);

        if ($this->_instance){
            $repeatno = $DB->count_records('ableplayer_caption', array('ableplayerid'=>$this->_instance));
        }
        $repeatno = !empty($repeatno) ? $repeatno : 1;

        $repeateloptions = [];
        $mform->setType('label', PARAM_TEXT);
        $mform->setType('captionid', PARAM_INT);

        // Define the repeat element options (empty in this case)
        $repeateloptions = array();

        // Repeat the elements without repeating the header
        $this->repeat_elements(
            $repeatarray,                  // The elements to be repeated
            $repeatno,                     // Number of repetitions
            $repeateloptions,              // Repeat element options (empty if not needed)
            'ableplayercaptions_repeats',  // Element name prefix for repeated elements
            'ableplayercaptions_add_fields', // Field name for "Add more" button
            1,                             // Number of blank fields to allow for extra entries
            null,                          // Add button options
            true                           // Allow deletion of repeated elements
        );

        // Add standard elements and buttons for the form
        $this->standard_coursemodule_elements();
        $this->add_action_buttons();
    }

    /**
     * Prepares default values for form elements related to media, descriptions, poster, and captions
     * for the AblePlayer module. This function retrieves existing records from the database,
     * prepares draft areas for file uploads, and sets up the form's default values based on the
     * current instance's data.
     *
     * @param array $defaultvalues An array to hold the default values for the form elements.
     *                              This array is modified by reference.
     */
    public function data_preprocessing(&$defaultvalues) {
        global $DB;

        if ($this->current->instance) {
            // Media.
            $options = ['subdirs' => false,
                'maxbytes' => 0,
                'maxfiles' => 1];
            $medias = $DB->get_records('ableplayer_media', ['ableplayerid' => $this->_instance]);
            // A bit of hack file_get_submitted_draft_itemid().
            if (!empty($_REQUEST['media']) && is_array($_REQUEST['media'])) {
                $draftitemids = optional_param_array('media', 0, PARAM_INT);
            } else {
                $draftitemids = optional_param('media', 0, PARAM_INT);
            }
            foreach (array_values($medias) as $key => $value) {
                if (is_array($draftitemids)) {
                    $draftitemid = $draftitemids[$key];
                } else {
                    $draftitemid = 0;
                }
                file_prepare_draft_area(
                    $draftitemid,
                    $this->context->id,
                    'mod_ableplayer',
                    'media',
                    $value->id,
                    $options
                );
                if ($draftitemid) {
                    $defaultvalues['media[' . $key . ']'] = $draftitemid;
                }
                $default_values['mediaid['.$key.']'] = $value->id;
                $default_values['url'][$key] = $value->url;
            }
            // Desc.
            $options = ['subdirs' => false,
                'maxbytes' => 0,
                'maxfiles' => 1];
            $mediadescs = $DB->get_records('ableplayer_desc', ['ableplayerid' => $this->_instance]);
            // A bit of hack file_get_submitted_draft_itemid().
            if (!empty($_REQUEST['desc']) && is_array($_REQUEST['desc'])) {
                $draftitemids = optional_param_array('desc', 0, PARAM_INT);
            } else {
                $draftitemids = optional_param('desc', 0, PARAM_INT);
            }
            foreach (array_values($mediadescs) as $key => $value) {
                if (is_array($draftitemids)) {
                    $draftitemid = $draftitemids[$key];
                } else {
                    $draftitemid = 0;
                }
                file_prepare_draft_area(
                    $draftitemid,
                    $this->context->id,
                    'mod_ableplayer',
                    'desc',
                    $value->id,
                    $options
                );
                if ($draftitemid) {
                    $defaultvalues['desc[' . $key . ']'] = $draftitemid;
                }
                $default_values['descid['.$key.']'] = $value->id;

            }
            // Poster.
            $options = ['subdirs' => false,
                'maxbytes' => 0,
                'maxfiles' => 1];
            $draftitemid = file_get_submitted_draft_itemid('poster');
            file_prepare_draft_area(
                $draftitemid,
                $this->context->id,
                'mod_ableplayer',
                'poster',
                0,
                $options
            );
            $defaultvalues['poster'] = $draftitemid;
            // Caption.
            $options = ['subdirs' => false,
                'maxbytes' => 0,
                'maxfiles' => 1];
            $captions = $DB->get_records('ableplayer_caption', ['ableplayerid' => $this->_instance]);
            // A bit of hack file_get_submitted_draft_itemid().
            if (!empty($_REQUEST['caption']) && is_array($_REQUEST['caption'])) {
                $draftitemids = optional_param_array('caption', 0, PARAM_INT);
            } else {
                $draftitemids = optional_param('captio', 0, PARAM_INT);
            }
            foreach (array_values($captions) as $key => $value) {
                if (is_array($draftitemids)) {
                    $draftitemid = $draftitemids[$key];
                } else {
                    $draftitemid = 0;
                }
                file_prepare_draft_area(
                    $draftitemid,
                    $this->context->id,
                    'mod_ableplayer',
                    'caption',
                    $value->id,
                    $options
                );
                if ($draftitemid) {
                    $defaultvalues['caption[' . $key . ']'] = $draftitemid;
                }
                $defaultvalues['kind[' . $key . ']'] = $value->kind;
                $defaultvalues['srclang[' . $key . ']'] = $value->srclang;
                $defaultvalues['label[' . $key . ']'] = $value->label;
                $defaultvalues['captionid[' . $key . ']'] = $value->id;
            }
        }
    }
}
