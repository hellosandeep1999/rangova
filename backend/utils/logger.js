const supabase = require('../supabase');

async function logActivity(adminUser, action, details) {
  try {
    const { error } = await supabase
      .from('admin_activity')
      .insert([{
        admin_user: adminUser || 'Admin',
        action,
        details,
        created_at: new Date().toISOString()
      }]);
    if (error) console.error('Error writing activity log:', error);
  } catch (err) {
    console.error('Failed to log activity:', err);
  }
}

module.exports = { logActivity };
