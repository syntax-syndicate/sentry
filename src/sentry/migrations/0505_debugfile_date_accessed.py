# Generated by Django 2.2.28 on 2023-07-05 08:04

import django.utils.timezone
from django.db import migrations, models

from sentry.new_migrations.migrations import CheckedMigration


class Migration(CheckedMigration):
    # This flag is used to mark that a migration shouldn't be automatically run in production. For
    # the most part, this should only be used for operations where it's safe to run the migration
    # after your code has deployed. So this should not be used for most operations that alter the
    # schema of a table.
    # Here are some things that make sense to mark as post deployment:
    # - Large data migrations. Typically we want these to be run manually by ops so that they can
    #   be monitored and not block the deploy for a long period of time while they run.
    # - Adding indexes to large tables. Since this can take a long time, we'd generally prefer to
    #   have ops run this and not block the deploy. Note that while adding an index is a schema
    #   change, it's completely safe to run the operation after the code has deployed.
    is_post_deployment = False

    allow_run_sql = True

    dependencies = [
        ("sentry", "0504_add_artifact_bundle_index"),
    ]

    # In accordance with <https://develop.sentry.dev/database-migrations/#adding-columns-with-a-default>:
    operations = [
        migrations.SeparateDatabaseAndState(
            database_operations=[
                # Accord to <https://www.postgresql.org/docs/current/sql-altertable.html>:
                # > When a column is added with ADD COLUMN and a non-volatile DEFAULT is specified,
                # > the default is evaluated at the time of the statement and the result stored in the table's metadata.
                # > That value will be used for the column for all existing rows.
                # Also according to <https://www.postgresql.org/docs/current/xfunc-volatility.html>:
                # > Another important example is that the current_timestamp family of functions qualify as STABLE,
                # > since their values do not change within a transaction.
                migrations.RunSQL(
                    """
                    ALTER TABLE "sentry_projectdsymfile" ADD COLUMN "date_accessed" timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP;
                    """,
                    reverse_sql="""
                    ALTER TABLE "sentry_projectdsymfile" DROP COLUMN "date_accessed";
                    """,
                    hints={"tables": ["sentry_projectdsymfile"]},
                ),
            ],
            state_operations=[
                migrations.AddField(
                    model_name="projectdebugfile",
                    name="date_accessed",
                    field=models.DateTimeField(default=django.utils.timezone.now),
                ),
            ],
        )
    ]
