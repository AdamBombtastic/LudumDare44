var menuState = {
    create : function() {
        var titleTextStyle = { font: "44px Arial", fill: "#ffEEFF", align:"center"};
        var textStyle = { font: "24px Arial", fill: "#ffEEFF", align:"center"};
        game.stage.backgroundColor = "#111111";
        this.titleText = game.add.text(game.centerX, game.centerY, "KING SAMOO'S SACRIFICE", titleTextStyle);
        this.titleText.centerX = CANVAS_WIDTH/2;
        this.titleText.centerY = CANVAS_HEIGHT/2;

        this.subTitleText = game.add.text(game.centerX, game.centerY,"Press Enter to Begin",textStyle);
        this.subTitleText.centerX = CANVAS_WIDTH/2;
        this.subTitleText.centerY = (CANVAS_HEIGHT/2) + 64;

        var tween = game.add.tween(this.subTitleText);
        tween.to({alpha:0},1000,"Linear",true,0,-1);

        this.spaceKey = game.input.keyboard.addKey(Phaser.Keyboard.ENTER);

        this.spaceKey.onDown.add(function() {
            finalScore = 0;
            game.state.start("game",true,false,null);
        },this);


    },
    update : function() {

    },
}