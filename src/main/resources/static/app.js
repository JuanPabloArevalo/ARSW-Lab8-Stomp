var app = (function () {

    class Point{
        constructor(x,y){
            this.x=x;
            this.y=y;
        }        
    }
    
    var stompClient = null;
    var identificador;
    
    var addPointToCanvas = function (point) {        
        var canvas = document.getElementById("canvas");
        var ctx = canvas.getContext("2d");
        ctx.beginPath();
        ctx.arc(point.x, point.y, 3, 0, 2 * Math.PI);
        ctx.stroke();
    };
    
    var addPolygonToCanvas = function (points){
        var canvas = document.getElementById("canvas");
        var ctx = canvas.getContext("2d");
        
        ctx.fillStyle = '#f00';
        ctx.beginPath();
       
        for(var i = 0; i < points.length; i++){
            if(i===0){
                 ctx.moveTo(points[i].x,points[i].y);
            }
            ctx.lineTo(points[i].x,points[i].y);
        }
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
    }
    
    
    var getMousePosition = function (evt) {
        canvas = document.getElementById("canvas");
        var rect = canvas.getBoundingClientRect();
        return {
            x: evt.clientX - rect.left,
            y: evt.clientY - rect.top
        };
    };


    var connectAndSubscribe = function () {
        console.info('Connecting to WS...');
        var socket = new SockJS('/stompendpoint');
        stompClient = Stomp.over(socket);
        
        //subscribe to /topic/TOPICXX when connections succeed
        stompClient.connect({}, function (frame) {
            console.log('Connected: ' + frame);
            stompClient.subscribe('/topic/newpoint.'+identificador, function (eventbody) {
                addPointToCanvas(JSON.parse(eventbody.body));
            });
             stompClient.subscribe('/topic/newpolygon.'+identificador, function (eventbody) {
                 addPolygonToCanvas(JSON.parse(eventbody.body));
            });
        });

    };
    
    

    return {
        conectarseIdentificador: function(identi){
            identificador = identi;
            connectAndSubscribe();
        },
        init: function () {
            var can = document.getElementById("canvas");
            if(window.PointerEvent) {
                can.addEventListener("pointerdown", function(event){
                    app.publishPoint(getMousePosition(event).x,getMousePosition(event).y)
                });
            }
            else {
                can.addEventListener("mousedown", function(event){
                    app.publishPoint(getMousePosition(event).x,getMousePosition(event).y)
                 }
            );
            }
            //websocket connection
            //connectAndSubscribe();
        },

        publishPoint: function(px,py){
            var pt=new Point(px,py);
            console.info("publishing point at "+pt);
            stompClient.send("/app/newpoint."+identificador, {}, JSON.stringify(pt));
        },


        disconnect: function () {
            if (stompClient !== null) {
                stompClient.disconnect();
            }
            setConnected(false);
            console.log("Disconnected");
        }
    };

})();