#include <stdio.h>
#include <stdlib.h>
#include <getopt.h>
#include <cstdlib>
#include <iostream>
#include <map>
#include <algorithm>

//#include "../../EllipseLib/header/TrackingSystem.h"
//#include "../../EllipseLib/header/TrackingFacade.h"
//
//#include "../../BehaviorLib/header/MainTrajectoriesSystem.h"
//#include "../../BehaviorLib/header/BehaviorFacade.h"
//
//#include "../header/XmlUtils.h"
//#include "../header/RecognitionFacade.h"
//
//#include <opencv/cv.h>
//#include <opencv/highgui.h>
#include <fstream>
#include <sstream>

#include <sys/types.h>
#include <sys/stat.h>
#include <unistd.h>

//void generateTrainingFrames(int trainingFrames, ofstream& fout, int std_output_flag){
//    // Generates trainingFrames empthy frames
//    cv::vector<DetectionDto> fPoints;
//    for (int i=0; i < trainingFrames; i++) {
//        string f = frameToXml(fPoints, i);
//        fout << f;
//        if(std_output_flag){
//            cout << f;
//        }
//    }
//}
//
//int scalarToInt( Scalar s){
//    return ((int) s[0])*1000000 + ((int) s[1])*1000 +
//                    ((int) s[2]);  
//}

///**
// * Print the xml tracking result to the outputFile, and into the standar output if
// * std_output_flag != 0
// * 
// * @param videoFile
// * @param outputFile
// * @param frameNumber
// * @param trainingFrames
// * @param std_output_flag
// * @param paths_often_dump determines after how many frames the reader becomes paths
// */
//void trackToFile(char* videoFile, char* outputFile, int frameNumber, 
//        int trainingFrames, int std_output_flag, int paths_often_dump) {
//    
//    cv::VideoCapture capture(videoFile);
//    cv::Mat frame;
//
//    //Init Tracking System
//    int nFrame = trainingFrames;
//    TrackingSystem tsys(capture, nFrame);
//
//    //Init Behavior System
//    int rows = capture.get(CV_CAP_PROP_FRAME_HEIGHT);
//    int cols = capture.get(CV_CAP_PROP_FRAME_WIDTH);
//    BehaviorFacade bFacade(rows, cols, paths_often_dump, 8, 1, 1.0);
//        
//    //File Output
//    ofstream fout(outputFile);
//    
//    std::map<int, cv::vector< std::pair<int, cv::Rect> > > tResult;
//    std::map<int, DetectionDto> pathsMap;
//    std::map<int, DetectionDto>::iterator iter;
//
//    fout << getXmlFileHeader() << "<objects>" << endl;
//
//    generateTrainingFrames(trainingFrames, fout, std_output_flag);
//    
//    // For each frame
//    while (capture.grab()) {
//        if ((frameNumber > 0) && (nFrame > frameNumber))
//            break;
//        
//        capture.retrieve(frame, 0);
//        nFrame++;
//        cv::vector< std::pair<int, cv::Rect> > frameDetections = tsys.processFrame(frame);
//        std::pair<int, cv::vector< std::pair<int, cv::Rect> > > pr(nFrame, frameDetections);
//        tResult.insert(pr);
//
//        cv::vector<DetectionDto> detections = bFacade.BehaviorFromFile(frame, tResult, nFrame);
//        
//        // Save the framePoints paths
//        for(int i=0; i<detections.size();i++){
//            
//            iter = pathsMap.find(scalarToInt(detections[i].id));
//            if (iter == pathsMap.end()){
//                //If the FramePoint doesn't exists
//                std::pair<int,DetectionDto> fpEntry;
//                fpEntry.first = scalarToInt(detections[i].id);
//                fpEntry.second = detections[i];
//                pathsMap.insert(fpEntry);
//            }else{
//                //If the frame point alredy exists we update it.
//                iter->second = detections[i];
//            }
//        }
//                
////        bFacade.getDensity();
////        bFacade.getVelocity();
////        FrameInfo fi = bFacade.TrajectoriesFromFile(frame,tResult,nFrame);
//        
//        // Print it into the output file
//        string f = frameToXml(detections, nFrame);
//        
//        
//        fout << f;
//        
//        if(std_output_flag){
//            cout << f;
//        }
//    }
//    fout << "</objects>" << endl;
//
//    // Print trajectories into the output file
//    fout << pathsToXml(pathsMap);
//
//    fout << getXmlFileTail();    
//    fout.close();
//    capture.release();
//}

/**
 * Dummy function
 */
void trackToFile(char* videoFile, char* outputFile, int frameNumber, 
        int trainingFrames, int std_output_flag, int paths_often_dump) {
    
    std::ofstream fout(outputFile);
    fout << "<?xml version=\"1.0\" encoding=\"UTF-8\" standalone=\"no\"?> " << std::endl;
    fout << "<!DOCTYPE dataset [" << std::endl;
    fout << "	   <!ELEMENT dataset (objects,trajectories)>" << std::endl; 
    fout << "	   <!ELEMENT objects (frame*)>" << std::endl; 
    fout << "	   <!ELEMENT frame (objectlist, grouplist?)>" << std::endl;
    fout << "	   <!ELEMENT objectlist (object*)>" << std::endl; 
    fout << "	   <!ELEMENT object (box, orientation?)>" << std::endl;
    fout << "	   <!ELEMENT orientation (#PCDATA)>" << std::endl;
    fout << "	   <!ELEMENT box EMPTY>" << std::endl;
    fout << "	   <!ELEMENT grouplist (#PCDATA)>" << std::endl;
    fout << "	   <!ELEMENT trajectories (trajectory*)>" << std::endl;
    fout << "	   <!ELEMENT trajectory (point*)>" << std::endl;
    fout << "	   <!ELEMENT point EMPTY>" << std::endl;
    fout << "	   <!ATTLIST frame number CDATA #REQUIRED>" << std::endl;
    fout << "	   <!ATTLIST object id CDATA #REQUIRED>" << std::endl;
    fout << "	   <!ATTLIST box h CDATA #REQUIRED>" << std::endl;
    fout << "	   <!ATTLIST box w CDATA #REQUIRED>" << std::endl;
    fout << "	   <!ATTLIST box xc CDATA #REQUIRED>" << std::endl;
    fout << "	   <!ATTLIST box yc CDATA #REQUIRED>" << std::endl;
    fout << "	   <!ATTLIST trajectory id CDATA #REQUIRED>" << std::endl;
    fout << "	   <!ATTLIST point abnormality CDATA #REQUIRED>" << std::endl;
    fout << "	   <!ATTLIST point frame CDATA #REQUIRED>" << std::endl;
    fout << "	   <!ATTLIST point x CDATA #REQUIRED>" << std::endl;
    fout << "	   <!ATTLIST point y CDATA #REQUIRED>" << std::endl;
    fout << "	]>" << std::endl;
    
    fout << "<dataset>" << std::endl;
    fout << "<objects>" << std::endl;
    fout << "</objects>" << std::endl;
    
    fout << "<trajectories>" << std::endl;
    fout << "</trajectories>" << std::endl;
    fout << "</dataset>" << std::endl;

}
