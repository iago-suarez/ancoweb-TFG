/* 
 * File:   XmlUtils.h
 * Author: iago
 *
 * Created on 8 de mayo de 2015, 12:50
 */

#ifndef XMLUTILS_H
#define	XMLUTILS_H


typedef struct{
    cv::Point point;
    int nframe;
    double abnormal_path_rate;
} FullPoint;

typedef struct {
    cv::vector<FullPoint> path;
    cv::Rect position;
    cv::Scalar id;
} DetectionDto;

string detectionToXml(DetectionDto detection);
string frameToXml(cv::vector<DetectionDto> fPoints, int nFrame);

string pathsToXml(std::map<int, DetectionDto> pathsMap);

string getXmlFileHeader();

string getXmlFileTail();

void trackToXmlFile(std::map<int, cv::vector< std::pair<int, cv::Rect> > > &DetectionsMap, 
        char* outputFile, int std_output_flag, int trainingFrames);

#endif	/* XMLUTILS_H */

