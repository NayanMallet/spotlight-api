import router from '@adonisjs/core/services/router'

// GUEST region Controller's Imports
const LoginController = () => import('#users/controllers/login_controller')
const RegisterController = () => import('#users/controllers/register_controller')
// endregion

router.group(() => {
  router.post('login', [LoginController]).as('users.login')
  router.post('register', [RegisterController]).as('users.register')
})
