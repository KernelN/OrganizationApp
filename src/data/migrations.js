export const CURRENT_SCHEMA_VERSION = 1;

/**
 * Executes schema migrations sequentially if settings.schema_version < CURRENT_SCHEMA_VERSION.
 * @param {Object} dal - DataAccessLayer instance
 */
export async function checkAndRunMigrations(dal) {
  const settings = await dal.getSettings();
  let currentVersion = settings.schema_version || 1;

  if (currentVersion < CURRENT_SCHEMA_VERSION) {
    // Future migrations go here:
    // if (currentVersion === 1) {
    //   await migrate_v1_to_v2(dal);
    //   currentVersion = 2;
    // }
    await dal.updateSettings({ schema_version: CURRENT_SCHEMA_VERSION });
  }
}
