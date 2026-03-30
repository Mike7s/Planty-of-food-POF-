const express = require("express");
const router = express.Router();

const  {
    createUser,
    deleteUser,
    updateUser,
    getUser
} = require('../controllers/users.controller')

router.post('/', createUser);
router.delete('/:id',deleteUser);
router.put('/:id',updateUser);
router.get('/:id',getUser);

module.exports = router;