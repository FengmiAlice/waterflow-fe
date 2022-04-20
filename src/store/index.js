/**
 * @Description: 全局状态管理
 */
import User from './modules/user'
import Common from './modules/common'

export default {
  userStore: new User(),
  commonStore: new Common(),
}
