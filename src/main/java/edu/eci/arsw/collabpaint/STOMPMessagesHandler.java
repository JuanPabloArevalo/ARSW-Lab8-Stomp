/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package edu.eci.arsw.collabpaint;

import java.awt.Point;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.concurrent.ConcurrentHashMap;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

@Controller
public class STOMPMessagesHandler {
	
    @Autowired
    SimpMessagingTemplate msgt;
    ConcurrentHashMap<String, ArrayList<Point>> puntosTopic = new ConcurrentHashMap<String, ArrayList<Point>>();

    @MessageMapping("/newpoint.{numdibujo}")    
    public void handlePointEvent(Point pt,@DestinationVariable String numdibujo) throws Exception {
            System.out.println("Nuevo punto recibido en el servidor!:"+pt);
            msgt.convertAndSend("/topic/newpoint."+numdibujo, pt);
            ArrayList<Point> puntos = puntosTopic.get(numdibujo);
            if(puntos==null){
                puntos = new ArrayList<>();
                puntos.add(pt);
                puntosTopic.put(numdibujo, puntos);
            }
            else{
                puntos.add(pt);
                puntosTopic.replace(numdibujo, puntos);
            }

            if(puntos.size()>=3){
                msgt.convertAndSend("/topic/newpolygon."+numdibujo, puntos);
            }
    }
        
        
}