var scoreState = {
    create : function() {
        var textStyle = { font: "44px Arial", fill: "#ffEEFF", align:"center"};
        game.stage.backgroundColor = "#111111";
        this.scoreText = game.add.text(game.centerX, game.centerY, "Score: " + finalScore + "\n Press Enter to restart!", textStyle);
        this.scoreText.centerX = CANVAS_WIDTH/2;
        this.scoreText.centerY = CANVAS_HEIGHT/2;
        this.spaceKey = game.input.keyboard.addKey(Phaser.Keyboard.ENTER);

        this.spaceKey.onDown.add(function() {
            finalScore = 0;
            game.state.start("game",true,false,null);
        },this);

    },
    update : function() {

    },

}