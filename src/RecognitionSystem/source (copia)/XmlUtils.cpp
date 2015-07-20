#include <iostream>
#include <fstream>

#include <opencv/cv.h>

using namespace std;

string detectionToXml(DetectionDto detection){
    
    stringstream result;

    int id = ((int) detection.id[0])*1000000 + ((int) detection.id[1])*1000 +
            ((int) detection.id[2]);
    
    result << "<object id=\"" << id << "\">" <<
                // "<orientation>45</orientation>
                "<box h=\"" << detection.position.height << 
                "\" w=\"" << detection.position.width << 
                "\" xc=\"" << detection.position.x << 
                "\" yc=\"" << detection.position.y << "\"/>" <<
//                <appearance>visible</appearance>
//                <hypothesislist>
//                    <hypothesis evaluation="1.0" id="1" prev="1.0">
//                        <movement evaluation="1.0">walking</movement>
//                        <role evaluation="1.0">walker</role>
//                        <context evaluation="1.0">immobile</context>
//                        <situation evaluation="1.0">moving</situation>
//                    </hypothesis>
//                 </hypothesislist>
            "</object>";
    
    return result.str();
}

string frameToXml(cv::vector<DetectionDto> fPoints, int nFrame){
    
    stringstream result;
    
    result << "<frame number=\"" << nFrame << "\">" << "<objectlist>";
    for (int i=0; i < (int) fPoints.size(); i++) {
        //Print Detection
        result << detectionToXml(fPoints[i]);
    }
    //Print frame tail
    result << "</objectlist>" << "<grouplist/>" <<
        "</frame>" << std::endl;

    result << std::endl;
    
    return result.str();
}


string pathsToXml(std::map<int, DetectionDto> pathsMap){
    
    stringstream result;
    std::map<int, DetectionDto>::iterator iter = pathsMap.begin();
    
    
    result << "<trajectories>" << endl;
    
    while(iter != pathsMap.end()){
        
        result << " <trajectory id=\"" << iter->first << "\">" << endl;
        
        for (int i=0; i<iter->second.path.size(); i++){
            result << "\t<point frame=\"" << iter->second.path[i].nframe << "\" ";
            result << "abnormality=\"" << iter->second.path[i].abnormal_path_rate << "\" ";
            result << "x=\"" << iter->second.path[i].point.x << "\" ";
            result << "y=\"" << iter->second.path[i].point.y << "\"></point>" << endl;    
        }
        
        result << " </trajectory>" << endl;
        
        iter++;
    }
    result << "</trajectories>" << endl;
    
    return result.str();
}

string getXmlFileHeader(){
   return "<?xml version=\"1.0\" encoding=\"UTF-8\"?> \n<dataset>\n";    
}

string getXmlFileTail(){
   return "</dataset>\n";
}