/* GET home page. */
exports.index = function(req, res){
  var game_id = req.params["id"];
  res.render('index', {
  	game_id : game_id
  });
};