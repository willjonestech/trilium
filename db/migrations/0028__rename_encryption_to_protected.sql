UPDATE audit_log SET category = 'PROTECTED' WHERE category = 'ENCRYPTION';

DELETE FROM notes WHERE note_clone_id IS NOT NULL AND note_clone_id != '';

CREATE TABLE `notes_mig` (
	`note_id`	TEXT NOT NULL,
	`note_title`	TEXT,
	`note_text`	TEXT,
	`date_created`	INT,
	`date_modified`	INT,
	`is_protected`	INT NOT NULL DEFAULT 0,
	`is_deleted`	INT NOT NULL DEFAULT 0,
	PRIMARY KEY(`note_id`)
);

INSERT INTO notes_mig (note_id, note_title, note_text, date_created, date_modified, is_protected, is_deleted)
    SELECT note_id, note_title, note_text, date_created, date_modified, encryption, is_deleted FROM notes;

DROP TABLE notes;
ALTER TABLE notes_mig RENAME TO notes;

CREATE INDEX `IDX_notes_is_deleted` ON `notes` (
	`is_deleted`
);

CREATE TABLE `notes_history_mig` (
	`note_history_id`	TEXT NOT NULL PRIMARY KEY,
	`note_id`	TEXT NOT NULL,
	`note_title`	TEXT,
	`note_text`	TEXT,
	`is_protected`	INT,
	`date_modified_from` INT,
	`date_modified_to` INT
);

INSERT INTO notes_history_mig (note_history_id, note_id, note_title, note_text, is_protected, date_modified_from, date_modified_to)
                        SELECT note_history_id, note_id, note_title, note_text, encryption, date_modified_from, date_modified_to FROM notes_history;

DROP TABLE notes_history;
ALTER TABLE notes_history_mig RENAME TO notes_history;

CREATE INDEX `IDX_notes_history_note_id` ON `notes_history` (
	`note_id`
);

CREATE INDEX `IDX_notes_history_note_date_modified_from` ON `notes_history` (
	`date_modified_from`
);

CREATE INDEX `IDX_notes_history_note_date_modified_to` ON `notes_history` (
	`date_modified_to`
);