var board = function ()
{
  var targetNum;
  var runNum = 0;
  var canvasWidth,canvasHeight,scale;
  var pieceSize = 80, space = 5;
  var canvas = document.getElementById('gameboard');
  var ctx = (canvas.getContext)?canvas.getContext('2d'):null;


  var tgtcanvas = document.getElementById('targetIcon');
  var tgtctx = (tgtcanvas.getContext)?tgtcanvas.getContext('2d'):null;

  var playInfo = {
    multipicand: -1,
    multiplier: -1,
    adder: -1,
    numSet: 0
  };

  var gamePieces = [];
  var targetPieces = [];

  var score = {
    turns: 0,
    right: 0,
    wrong: 0,
    passed: 0
  }

  return {
    draw: function()
    {
      if (ctx != null)
      {
        //get board dimensions
        getBoardSize(); 
        //get randomized board pieces if not already initialized
        if(gamePieces.length == 0) gamePieces = shuffle(boardPieces);
        //same for target pieces
        if(targetPieces.length == 0) targetPieces = shuffle(numPieces);
        console.log(runNum);
        if(runNum >= 3) youAreDone();
        else
        {
          targetNum = targetPieces[runNum];
          drawTgtNum(targetNum);
        } 
        //scale the board
        canvas.width = canvasWidth;
        canvas.height = canvasHeight;
        ctx.scale(scale,scale);
        //draw the game pieces
        var x, y;
        var gamePiece = 0;
        x = 0 + space;
        y = 0 + space;
        for(var row = 0; row < 7; row++)
        {
            for(var col = 0; col < 7; col++)
            {
                drawGamePiece(x,y,gamePiece);
                x += pieceSize + space;
                gamePiece++;
            }
            x = 0 + space;
            y += pieceSize + space;
        }
        $("#turns").html(score.turns);
        $("#right").html(score.right);
        $("#wrong").html(score.wrong);
        $("#passed").html(score.passed);
        window.scrollTo(0, 1);
      }
    },

    select: function(x,y)
    {
      var col = Math.floor(x / ((pieceSize + space) * scale));
      if(col > 6) col = 6;
      var row = Math.floor(y / ((pieceSize + space) * scale));
      if(row > 6) row = 6;
      var arrIndex = col + (row * 7);
      if(isSelectable(col, row))
      {
        if(!gamePieces[arrIndex].selected)
        {
          gamePieces[arrIndex].selected = true;
          //get location for drawing the modified item
          var newX = col * pieceSize + (space*(col+1));
          var newY = row * pieceSize + (space*(row+1));

          //draw the modified item
          drawGamePiece(newX,newY,arrIndex);

          setPlayInfo(arrIndex);
          if(playInfo.numSet == 3)
          {
            checkSelections();
            //resetSelections();
            //this.draw();
          }
        }
      }
      else
      {
        showMessage("Numbers must be in a horizontal, vertical or diagonal row!", true);
      }
    },

    swap: function(x,y)
    {
      var col = Math.floor(x / ((pieceSize + space) * scale));
      if(col > 6) col = 6;
      var row = Math.floor(y / ((pieceSize + space) * scale));
      if(row > 6) row = 6;
      var arrIndex = col + (row * 7);
      var newX = col * pieceSize + (space*(col+1));
      var newY = row * pieceSize + (space*(row+1));

      if(gamePieces[arrIndex].value == 9)
      { 
        gamePieces[arrIndex].value = 6;
        drawGamePiece(newX,newY,arrIndex);
      }
      else if(gamePieces[arrIndex].value == 6) 
      {
        gamePieces[arrIndex].value = 9;
        drawGamePiece(newX,newY,arrIndex);
      }
    },

    clearSelections: function()
    {
      resetSelections();
      this.draw();
    },

    pass: function()
    {
      score.passed++;
      runNum++;
      resetSelections();
      this.draw();
    }
  }

  function drawTgtNum(num)
  {
    var yPos = (num < 10)?15:8;
    tgtctx.beginPath();
    tgtctx.arc(25, 25, 25, 0, 2 * Math.PI, false);
    tgtctx.fillStyle = 'DodgerBlue';
    tgtctx.fill();

    tgtctx.fillStyle = 'white';
    tgtctx.font = 'bold 25pt Calibri';
    tgtctx.fillText(num, yPos, 35);
  }

  function checkSelections()
  {
    var num1 = gamePieces[playInfo.multipicand].value;
    var num2 = gamePieces[playInfo.multiplier].value;
    var num3 = gamePieces[playInfo.adder].value;
    var result = "";
    var error = false;
    if(num1 * num2 + num3 == targetNum)
    {
      result = "Correct, " + num1 + " * " + num2 + " + " + num3 + " equals " + targetNum;
      runNum++;
      score.right++;
    }
    else if(num1 * num2 - num3 == targetNum)
    {
      result = "Correct, " + num1 + " * " + num2 + " - " + num3 + " equals " + targetNum;
      runNum++;
      score.right++;
    }
    else
    {
      result = "Sorry, " + num1 + " * " + num2 + " +/- " + num3 + " does not equal " + targetNum;
      score.wrong++;
      error = true;
    }
    score.turns++;
    showMessage(result, error);
  }

  function resetSelections()
  {
    for(var i = 0; i < gamePieces.length; i++)
    {
      gamePieces[i].selected = false;
    }
    playInfo.multipicand = -1;
    playInfo.multiplier =  -1;
    playInfo.adder = -1;
    playInfo.numSet = 0;
  }

  function isSelectable(col, row)
  {
    var isSelectable = false;
    var multipicandIdx = playInfo.multipicand;
    var multiplierIdx = playInfo.multiplier;
    var xOk, yOk = false;
    var mulX, mulY = 0;
    switch(playInfo.numSet) 
    {
      case 0:
          isSelectable = true;
          break;
      case 1:
          mulX = multipicandIdx % 7;
          mulY = Math.floor(multipicandIdx / 7);
          if(mulX == col || mulX - 1 == col || mulX + 1 == col) xOk = true;
          if(mulY == row || mulY - 1 == row || mulY + 1 == row) yOk = true;
          isSelectable = xOk && yOk;
          break;
      case 2:
          mulX = multipicandIdx % 7;
          mulY = Math.floor(multipicandIdx / 7);
          var mprX = multiplierIdx % 7;
          var mprY = Math.floor(multiplierIdx / 7);
          //previous selections in same col
          if(mulX == mprX)
          {
            xOk = (col == mprX);
            yOk = ((mulY > mprY && row == mprY - 1) || (mulY < mprY && row == mprY + 1));
          }
          else if(mulY == mprY) //previous selections in same row
          {
            yOk = (row == mprY);
            xOk = ((mulX > mprX && col == mprX - 1) || (mulX < mprX && col == mprX + 1));
          }
          else  //check diaganals
          {
            if(mulY > mprY)
            {
              yOk = ((mulX > mprX && row == mprY - 1) || (mulX < mprX && row == mprY - 1));
              xOk = ((mulX > mprX && col == mprX - 1) || (mulX < mprX && col == mprX + 1));
            }
            else
            {
              yOk = ((mulX > mprX && row == mprY + 1) || (mulX < mprX && row == mprY + 1));
              xOk = ((mulX > mprX && col == mprX - 1) || (mulX < mprX && col == mprX + 1));
            }
          }
          isSelectable = xOk && yOk;
          break;
    } 
    return isSelectable;
  }

  function setPlayInfo(index)
  {
    var count = playInfo.numSet;
    if(count == 0)
    {
      playInfo.multipicand = index;
      playInfo.numSet++;
    }
    else if(count==1)
    {
      playInfo.multiplier = index;
      playInfo.numSet++;
    }
    else
    {
      playInfo.adder = index;
      playInfo.numSet++;
    }
  }

  function drawGamePiece(x,y,gamePiece)
  {
    var text = gamePieces[gamePiece].value;
    var color = gamePieces[gamePiece].color;
    var selected = gamePieces[gamePiece].selected;
    //the main piece
    var size = 80,
        centerX = x + (size / 2),
        centerY = y + (size / 2);

    ctx.fillStyle = color;
    ctx.strokeStyle = (selected)?'white':'black';
    ctx.lineWidth=4;
    ctx.fillStyle = (selected)?'DarkMagenta':color;
    roundRect(ctx, x, y, size, size, 20, true, true);
    ctx.lineWidth=1;
    //the circle
    ctx.beginPath();
    ctx.arc(centerX, centerY, 33, 0, 2 * Math.PI, false);
    ctx.fillStyle = (selected)?'black':'white';
    ctx.fill();
    //text
    ctx.fillStyle = (selected)?'white':'black';
    ctx.font = 'bold 55pt Calibri';
    ctx.fillText(text, x + 20, y + 65);
  }

  function roundRect(ctx, x, y, width, height, radius, fill, stroke) 
  {
    if (typeof stroke == "undefined" ) stroke = true;
    if (typeof radius === "undefined") radius = 5;
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    ctx.lineTo(x + width, y + height - radius);
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    ctx.lineTo(x + radius, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.closePath();
    if (stroke) ctx.stroke();
    if (fill) ctx.fill(); 
  }

  function getBoardSize()
  {
    var width = $(window).width();
    var height = $(window).height();
    var orientation = (width < height)?"portrait":"landscape";
   
    if(orientation == "landscape")
    {
      canvasHeight = canvasWidth = height;
      scale = height / 600;
      $('#tgtDiv').css('padding-top','10px');
    }
    else
    {
      canvasHeight = canvasWidth = width;
      scale = width / 600;
      $('#tgtDiv').css('padding-top','0px');
    }
  }

  function shuffle(array) 
  {
    var currentIndex = array.length, temporaryValue, randomIndex ;
    // While there remain elements to shuffle...
    while (0 !== currentIndex) 
    {
        // Pick a remaining element...
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex -= 1;
        // And swap it with the current element.
        temporaryValue = array[currentIndex];
        array[currentIndex] = array[randomIndex];
        array[randomIndex] = temporaryValue;
    }
    return array;
  }

  function youAreDone()
  {
    showMessage("Congrats, you have completed all 50 target numbers!!!", false);
  }

  function showMessage(message, error){
    $("#message").html(message);

    if(error) $("#modal-content").css("border-color", "red");
    else $("#modal-content").css("border-color", "green");

    $("#modal-content, #modal-background").addClass("active");
  }
  
}();