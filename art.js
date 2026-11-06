// Prepared once: rendering only reads these surfaces and simulation positions.
var prepareImages = function(){
	var surface = function(width, height, draw){
		var canvas = document.createElement("canvas");
		canvas.width = width;
		canvas.height = height;
		draw(canvas.getContext("2d"));
		return canvas;
	};
	var tower = function(top){
		return surface(50, 512, function(ctx){
			ctx.fillStyle = "#071B35";
			ctx.fillRect(0, 0, 50, 512);
			ctx.fillStyle = "#D8A541";
			ctx.fillRect(2, 0, 46, 512);
			ctx.fillStyle = "#90662D";
			ctx.fillRect(35, 0, 11, 512);
			ctx.fillStyle = "#FFF0BD";
			ctx.fillRect(5, 0, 2, 512);
			for(var y = 8; y < 512; y += 48){
				ctx.fillStyle = "#071B35";
				ctx.fillRect(11, y, 21, 30);
				ctx.fillStyle = "#234557";
				ctx.fillRect(13, y + 2, 17, 26);
				ctx.fillStyle = "#6DE1EF";
				ctx.fillRect(14, y + 4, 3, 21);
				ctx.fillStyle = "#83CF87";
				ctx.fillRect(23, y + 5, 5, 4);
				ctx.fillStyle = "#071B35";
				ctx.fillRect(2, y + 35, 46, 3);
				ctx.fillStyle = "#F15445";
				ctx.fillRect(38, y + 8, 5, 13);
			}
			var edge = top ? 500 : 0;
			ctx.fillStyle = "#071B35";
			ctx.fillRect(0, edge, 50, 12);
			ctx.fillStyle = "#D8A541";
			ctx.fillRect(2, edge + 2, 46, 8);
			ctx.fillStyle = "#FFF0BD";
			ctx.fillRect(5, edge + 3, 40, 2);
		});
	};
	return {
		bird:surface(40, 30, function(ctx){
			ctx.lineWidth = 2;
			ctx.strokeStyle = "#071B35";
			ctx.fillStyle = "#D8A541";
			ctx.beginPath();
			ctx.moveTo(3, 10); ctx.lineTo(10, 12); ctx.lineTo(14, 4);
			ctx.lineTo(29, 3); ctx.lineTo(35, 10); ctx.lineTo(39, 16);
			ctx.lineTo(33, 20); ctx.lineTo(29, 26); ctx.lineTo(13, 26);
			ctx.lineTo(8, 22); ctx.lineTo(2, 24); ctx.closePath();
			ctx.fill(); ctx.stroke();
			ctx.fillStyle = "#6DE1EF";
			ctx.beginPath(); ctx.moveTo(22, 6); ctx.lineTo(29, 6);
			ctx.lineTo(33, 12); ctx.lineTo(22, 12); ctx.closePath();
			ctx.fill(); ctx.stroke();
			ctx.fillStyle = "#FFF0BD";
			ctx.fillRect(23, 7, 6, 2);
			ctx.fillStyle = "#90662D";
			ctx.beginPath(); ctx.moveTo(9, 15); ctx.lineTo(23, 15);
			ctx.lineTo(19, 23); ctx.lineTo(12, 23); ctx.closePath();
			ctx.fill(); ctx.stroke();
			ctx.fillStyle = "#F15445"; ctx.fillRect(4, 15, 5, 4);
		}),
		pipetop:tower(true),
		pipebottom:tower(false),
		background:surface(1000, 512, function(ctx){
			var sky = ctx.createLinearGradient(0, 0, 0, 512);
			sky.addColorStop(0, "#071B35"); sky.addColorStop(1, "#15394C");
			ctx.fillStyle = sky; ctx.fillRect(0, 0, 1000, 512);
			for(var i = 0; i < 100; i++){
				// Fixed coordinates avoid consuming the learning simulation's random stream.
				ctx.fillStyle = i % 3 ? "#436574" : "#91A5AA";
				ctx.fillRect((i * 137 + 31) % 1000, (i * 79 + 17) % 512, i % 7 ? 1 : 2, 1);
			}
			ctx.fillStyle = "#276579";
			ctx.beginPath(); ctx.arc(358, 126, 63, 0, Math.PI * 2); ctx.fill();
			ctx.strokeStyle = "#4C96A4"; ctx.lineWidth = 2;
			ctx.beginPath(); ctx.ellipse(358, 126, 89, 17, -0.35, 0, Math.PI * 2); ctx.stroke();
			ctx.fillStyle = "#24556B";
			ctx.beginPath(); ctx.arc(377, 118, 51, 0, Math.PI * 2); ctx.fill();
			for(var j = 0; j < 16; j++){
				var x = j * 67;
				var h = 45 + (j * 43) % 125;
				ctx.fillStyle = "#193A4B";
				ctx.fillRect(x, 512 - h, 45, h);
				ctx.strokeStyle = "#3F514C";
				ctx.strokeRect(x + 4, 512 - h + 4, 37, h);
				ctx.fillStyle = "#6D684C";
				ctx.fillRect(x + 8, 512 - h + 8, 2, h - 8);
				ctx.fillStyle = "#375D61";
				for(var k = 0; k < 3; k++){
					ctx.fillRect(x + 16 + k * 7, 512 - h + 18, 3, h - 18);
				}
				ctx.fillStyle = "#234555";
				ctx.fillRect(x + 42, 512 - h + 22, 26, 7);
			}
		})
	};
};
