# Generated by Django 5.0.4 on 2024-04-30 18:07

from django.db import migrations

from sentry.new_migrations.migrations import CheckedMigration


class Migration(CheckedMigration):
    # This flag is used to mark that a migration shouldn't be automatically run in production.
    # This should only be used for operations where it's safe to run the migration after your
    # code has deployed. So this should not be used for most operations that alter the schema
    # of a table.
    # Here are some things that make sense to mark as post deployment:
    # - Large data migrations. Typically we want these to be run manually so that they can be
    #   monitored and not block the deploy for a long period of time while they run.
    # - Adding indexes to large tables. Since this can take a long time, we'd generally prefer to
    #   run this outside deployments so that we don't block them. Note that while adding an index
    #   is a schema change, it's completely safe to run the operation after the code has deployed.
    # Once deployed, run these manually via: https://develop.sentry.dev/database-migrations/#migration-deployment

    is_post_deployment = False

    allow_run_sql = True

    dependencies = [
        ("sentry", "0709_alertrule_remove_owner_state"),
    ]

    operations = [
        # Remove the foreign key constraint from schema and remove the field from django metadata
        migrations.SeparateDatabaseAndState(
            database_operations=[
                migrations.RunSQL(
                    sql="""
                    ALTER TABLE "sentry_grouphistory" DROP CONSTRAINT IF EXISTS "sentry_grouphistory_actor_id_085453d6_fk_sentry_actor_id"
                    """,
                    reverse_sql="",
                    hints={"tables": ["sentry_grouphistory"]},
                )
            ],
            state_operations=[
                migrations.RemoveField(
                    model_name="grouphistory",
                    name="actor",
                ),
            ],
        )
    ]
