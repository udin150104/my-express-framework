const { userModel, PermissionUserModel, PermissionRoleModel } = require('./../databases/models');

/**
 * Cek apakah user punya permission untuk slug tertentu
 * @param {object} sessionUser - req.session.user
 * @param {string} slug - Misalnya: "pengaturan.pengguna"
 * @param {string} permission - Misalnya: "view", "edit", "delete"
 * @returns {Promise<boolean>}
 */
async function hasPermission(sessionUser, slug, permission) {
  if (!sessionUser) return false;

  const { id: userId, role } = sessionUser;

  // console.log(role)
  // Jika superadmin → akses semua
  if (role === 'superadmin') return true;

  // Cek dari permission_user (khusus user)
  const userPerm = await PermissionUserModel.findOne({
    where: { user_id: userId, slug, permission }
  });
  if (userPerm) return true;

  // Cek dari permission_role (berdasarkan role)
  const rolePerm = await PermissionRoleModel.findOne({
    where: { role, slug, permission }
  });

  return !!rolePerm;
}

/**
 * Cek apakah user punya salah satu dari beberapa permission
 * @param {object} sessionUser - req.session.user
 * @param {string} slug
 * @param {string[]} permissions - Array of permission string
 * @returns {Promise<boolean>}
 */
async function hasAnyPermission(sessionUser, slug, permissions = []) {
  for (const perm of permissions) {
    if (await hasPermission(sessionUser, slug, perm)) {
      return true;
    }
  }
  return false;
}

module.exports = { hasPermission, hasAnyPermission };
