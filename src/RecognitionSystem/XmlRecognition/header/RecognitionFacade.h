/* 
 * File:   BehaviourCaller.h
 * Author: iago
 *
 * Created on 15 de junio de 2015, 21:17
 */

#ifndef BEHAVIOURCALLER_H
#define	BEHAVIOURCALLER_H

using namespace std;


void trackToFile(char* videoFile, char* outputFile, int frameNumber, 
        int trainingFrames, int std_output_flag, int paths_often_dump);

#endif	/* BEHAVIOURCALLER_H */

