   var tutCount = 0;
   var tutorialState = {
        create : function() {

            var tut = [ game.add.sprite(0,0,"ui_tutorial1"),game.add.sprite(0,0,"ui_tutorial2"),game.add.sprite(0,0,"ui_tutorial3")];
            this.spaceKey = game.input.keyboard.addKey(Phaser.Keyboard.ENTER);
            for (var i = 0; i < tut.length; i++) {
                tut[i].alpha = 0;
            }
            tut[tutCount].alpha = 1;
            this.spaceKey.onDown.add(function() {
                if (tutCount > 2) {
                    game.state.start("game",true,false,null);
                }
                for (var i = 0; i < tut.length; i++) {
                    tut[i].alpha = 0;
                }
                tutCount += 1;
                if (tut[tutCount] == null)  game.state.start("game",true,false,null);
                else tut[tutCount].alpha = 1;
                
               
            },this);
    
    
        },
        update : function() {
            
        },
    }