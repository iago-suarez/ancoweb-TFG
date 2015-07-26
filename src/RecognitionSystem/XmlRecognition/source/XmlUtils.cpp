//#include <iostream>
//#include <fstream>
//
//#include "../header/XmlUtils.h"
//#include "../../BehaviorLib/header/Detection.h"
//
//#include <opencv/cv.h>
//
//using namespace std;
//
//string detectionToXml(DetectionDto detection){
//    
//    stringstream result;
//
//    int id = ((int) detection.id[0])*1000000 + ((int) detection.id[1])*1000 +
//            ((int) detection.id[2]);
//    
//    result << "<object id=\"" << id << "\">" <<
//                // "<orientation>45</orientation>
//                "<box h=\"" << detection.position.height << 
//                "\" w=\"" << detection.position.width << 
//                "\" xc=\"" << detection.position.x << 
//                "\" yc=\"" << detection.position.y << "\"/>" <<
////                <appearance>visible</appearance>
////                <hypothesislist>
////                    <hypothesis evaluation="1.0" id="1" prev="1.0">
////                        <movement evaluation="1.0">walking</movement>
////                        <role evaluation="1.0">walker</role>
////                        <context evaluation="1.0">immobile</context>
////                        <situation evaluation="1.0">moving</situation>
////                    </hypothesis>
////                 </hypothesislist>
//            "</object>";
//    
//    return result.str();
//}
//
//string frameToXml(cv::vector<DetectionDto> fPoints, int nFrame){
//    
//    stringstream result;
//    
//    result << "<frame number=\"" << nFrame << "\">" << "<objectlist>";
//    for (int i=0; i < (int) fPoints.size(); i++) {
//        //Print Detection
//        result << detectionToXml(fPoints[i]);
//    }
//    //Print frame tail
//    result << "</objectlist>" << "<grouplist/>" <<
//        "</frame>" << std::endl;
//
//    result << std::endl;
//    
//    return result.str();
//}
//
//
//string pathsToXml(std::map<int, DetectionDto> pathsMap){
//    
//    stringstream result;
//    std::map<int, DetectionDto>::iterator iter = pathsMap.begin();
//    
//    
//    result << "<trajectories>" << endl;
//    
//    while(iter != pathsMap.end()){
//        
//        result << " <trajectory id=\"" << iter->first << "\">" << endl;
//        
//        for (int i=0; i<iter->second.path.size(); i++){
//            result << "\t<point frame=\"" << iter->second.path[i].nframe << "\" ";
//            result << "abnormality=\"" << iter->second.path[i].abnormal_path_rate << "\" ";
//            result << "x=\"" << iter->second.path[i].point.x << "\" ";
//            result << "y=\"" << iter->second.path[i].point.y << "\"></point>" << endl;    
//        }
//        
//        result << " </trajectory>" << endl;
//        
//        iter++;
//    }
//    result << "</trajectories>" << endl;
//    
//    return result.str();
//}
//
//string getXmlFileHeader(){
//    stringstream result;
//    result << "<?xml version=\"1.0\" encoding=\"UTF-8\" standalone=\"no\"?> \n";
//    result << "<!DOCTYPE dataset [\n";
//    result << "	   <!ELEMENT dataset (objects,trajectories)>\n";
//    result << "	   <!ELEMENT objects (frame*)>\n";
//
//    result << "	   <!ELEMENT frame (objectlist, grouplist?)>\n";
//    result << "	   <!ELEMENT objectlist (object*)>\n";
//    result << "	   <!ELEMENT object (box, orientation?)>\n";
//    result << "	   <!ELEMENT orientation (#PCDATA)>\n";
//    result << "	   <!ELEMENT box EMPTY>\n";
//    result << "	   <!ELEMENT grouplist (#PCDATA)>\n";
//
//    result << "	   <!ELEMENT trajectories (trajectory*)>\n";
//    result << "	   <!ELEMENT trajectory (point*)>\n";
//    result << "	   <!ELEMENT point EMPTY>\n";
//
//    result << "	   <!ATTLIST frame number CDATA #REQUIRED>\n";
//    result << "	   <!ATTLIST object id CDATA #REQUIRED>\n";
//
//    result << "	   <!ATTLIST box h CDATA #REQUIRED>\n";
//    result << "	   <!ATTLIST box w CDATA #REQUIRED>\n";
//    result << "	   <!ATTLIST box xc CDATA #REQUIRED>\n";
//    result << "	   <!ATTLIST box yc CDATA #REQUIRED>\n";
//
//    result << "	   <!ATTLIST trajectory id CDATA #REQUIRED>\n";
//    result << "	   <!ATTLIST point abnormality CDATA #REQUIRED>\n";
//    result << "	   <!ATTLIST point frame CDATA #REQUIRED>\n";
//    result << "	   <!ATTLIST point x CDATA #REQUIRED>\n";
//    result << "	   <!ATTLIST point y CDATA #REQUIRED>\n";
//    result << "	]>\n";
//    
//    result << "<dataset>\n";
//    
//    return result.str();
//}
//
//string getXmlFileTail(){
//   return "</dataset>\n";
//}