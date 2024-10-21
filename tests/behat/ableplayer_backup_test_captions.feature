@mod @mod_ableplayer @_file_upload
Feature: Backup Test Captions
  In order to set up my course contents quickly
  As a teacher with editing permissions
  I need to duplicate activities inside the same course

  Background:
    Given the following "users" exist:
      | username | firstname | lastname | email                | idnumber |
      | teacher1 | Teacher   | 1        | teacher1@example.com | T1       |
      | student1 | Student   | 1        | student1@example.com | S1       |

    And the following "courses" exist:
      | fullname | shortname | category | enablecompletion |
      | Course 1 | C1        | 0        | 1                |
    And the following "course enrolments" exist:
      | user     | course | role           |
      | teacher1 | C1     | editingteacher |
      | student1 | C1     | student        |
    And the following "activity" exists:
      | activity                            | ableplayer                                           |
      | course                              | C1                                                   |
      | name                                | My First Ableplayer                                  |
      | playlist                            | 0                                                    |
      | mode                                |                                                      |
      | lang                                |                                                      |
      | poster                              |                                                      |
      | captions[0]                         | /mod/ableplayer/tests/fixtures/sample_description.vtt|
    And the following config values are set as admin:
      | backup_import_activities | 0 | backup |

  @javascript
  Scenario: Duplicate an ableplayer with a captions file
    Given I log in as "teacher1"
    And I am on "Course 1" course homepage with editing mode on
    And I click on "My First Ableplayer" "link" in the "General" "section"
    And I click on "Settings" "link"
    And I click on "Expand all" "button"
    And I upload "/mod/ableplayer/tests/fixtures/sample_description.vtt" file to "Captions" filemanager
    And I press "Save and display"
    And I click on "Course 1" "link"
    And I duplicate "My First Ableplayer" activity
    And I should see "My First Ableplayer (copy) "
    And I click on "My First Ableplayer (copy)" "link" in the "General" "section"
    And I click on "Settings" "link"
    And I click on "Expand all" "button"
    And I should see "sample_description.vtt"
