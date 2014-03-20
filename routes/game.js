/* GET game page. */
exports.game = function(req, res){
  var game_id = req.params["id"];
  res.render('index', {
  	game_id : game_id
  });
};