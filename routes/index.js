/* Get Home Page */
exports.select = function(req,res){
	console.log("select");
	res.render('select.jade');
};

exports.game = function(req, res){
  var game_id = req.params["id"];
  console.log("game");
  res.render('game.jade', {
  	game_id : game_id
  });
};