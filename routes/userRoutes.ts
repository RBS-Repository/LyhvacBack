import express from 'express';
import {
  getUsers,
  getUserById,
  getUserByFirebaseUID,
  createUser,
  updateUser,
  disableUser,
  enableUser,
  deleteUser,
} from '../controllers/userController';

const router = express.Router();

router.route('/').get(getUsers).post(createUser);
router.route('/uid/:uid').get(getUserByFirebaseUID);
router.route('/:id').get(getUserById).put(updateUser).delete(deleteUser);
router.route('/:id/disable').put(disableUser);
router.route('/:id/enable').put(enableUser);

export default router;

