var express = require('express');
var router = express.Router();

/* GET: Returns the currently logged-in user. */
router.get('/', function(req, res) {
  if (req.user)
  {
    res.json(req.user);
  }
  else
  {
    res.send(401);
  }
});

/* DELETE: logs out */
router.delete('/', function(req, res) {
    req.logout();
    res.send(200);
});

module.exports = router;
