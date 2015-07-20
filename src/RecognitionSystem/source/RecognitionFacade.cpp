#include <stdio.h>
#include <stdlib.h>
#include <getopt.h>
#include <cstdlib>
#include <map>
#include <algorithm>

#include <fstream>
#include <sstream>

#include <sys/types.h>
#include <sys/stat.h>
#include <unistd.h>

#include <../header/RecognitionFacade.h>
#include <../header/XmlUtils.h>

/**
 * Print the xml tracking result to the outputFile, and into the standar output if
 * std_output_flag != 0
 * 
 * @param videoFile
 * @param outputFile
 * @param frameNumber
 * @param trainingFrames
 * @param std_output_flag
 * @param paths_often_dump determines after how many frames the reader becomes paths
 */
void trackToFile(char* videoFile, char* outputFile, int frameNumber, 
        int trainingFrames, int std_output_flag, int paths_often_dump) {
        
    //File Output
    ofstream fout(outputFile);

    fout << getXmlFileHeader() << "<objects>" << endl;

//    /* Generate Training Frames */
//    ...
            
//    /* For each frame */
//    while (capture.grab()) {
//        if ((frameNumber > 0) && (nFrame > frameNumber))
//            break;
//        
//        /* Get the detections fro the current frame */
//        
//        ...
//    
//        /* Print it into the output file */
//        string f = frameToXml(detections, nFrame);
//        
//        
//        fout << f;
//        
//        if(std_output_flag){
//            cout << f;
//        }
//    }
    fout << "</objects>" << endl;

    /* Print trajectories into the output file */
//    fout << pathsToXml(pathsMap);

    fout << getXmlFileTail();    
    fout.close();
}
