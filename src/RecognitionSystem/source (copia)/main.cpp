/* 
 * File:   main.cpp
 * Author: iago
 *
 * Created on 28 de abril de 2015, 18:32
 */
#include <stdio.h>
#include <stdlib.h>
#include <getopt.h>
#include <cstdlib>
#include <iostream>
#include <map>

#include <opencv/cv.h>
#include <opencv/highgui.h>
#include <fstream>
#include <sstream>

#include <sys/types.h>
#include <sys/stat.h>
#include <unistd.h>
#include <sys/stat.h>


using namespace std;
using namespace cv;

/* Flag set by ‘--verbose’. */
static int verbose_flag;
static int std_output_flag = false;
static int help_flag = false;
int frecuency = 15; 
/**
 * Recursive mkdir
 * 
 * @param dir
 */
static void rmkdir(const char *dir) {
        char tmp[256];
        char *p = NULL;
        size_t len;

        snprintf(tmp, sizeof(tmp),"%s",dir);
        len = strlen(tmp);
        if(tmp[len - 1] == '/')
                tmp[len - 1] = 0;
        for(p = tmp + 1; *p; p++)
                if(*p == '/') {
                        *p = 0;
                        mkdir(tmp, S_IRWXU);
                        *p = '/';
                }
        mkdir(tmp, S_IRWXU);
}

void createDirIfNotExists(char * output){

    string directory;
    string filename(output);
    
    const size_t last_slash_idx = filename.rfind('/');
    
    //Si se trata de un directorio, lo creamos en caso de no existir
    if (std::string::npos != last_slash_idx){
        
        directory = filename.substr(0, last_slash_idx);
    
        struct stat st = {0};
        //Si el directorio no existe lo creamos
        if (stat(directory.c_str(), &st) == -1) {
            cout << "Creating directory: " << directory << endl;
            rmkdir(directory.c_str());
        }    
    }
}

void print_help(){
    cout << endl <<"Usage:   " << "recognitionsystem" << endl;
    cout<<"option:  " << endl;
    cout<<"-i          " << "--input      " << "<path/to/outputFile.xml> Set the input file." <<endl;
    cout<<"-o          " << "--output     " << "<path/to/outputFile.xml> Set the output file."<<endl;
    cout<<"-f [value]  " << "--frequency  " << "Determines after how many frames the Behaviour "<<endl;
    cout<<"            " << "             " << "System checks the minimal path" << endl;
    cout<<"--standar   " << "             " << "Print the xml into the standar output." << endl;
    cout<<"--verbose" << endl << endl;
}

int main(int argc, char **argv) {
    int c;

    char * input = NULL; 
    char * output = NULL; 
    
    while (1) {
        static struct option long_options[] ={
            /* These options set a flag. */
            {"verbose", no_argument, &verbose_flag, 1},
            {"standar", no_argument, &std_output_flag, 1},
            {"help", no_argument, &help_flag, 1},
            /* These options don’t set a flag.
               We distinguish them by their indices. */
            {"input", required_argument, 0, 'i'},
            {"output", required_argument, 0, 'o'},
            {"frequency", required_argument, 0, 'f'},
            {0, 0, 0, 0}
        };
        /* getopt_long stores the option index here. */
        int option_index = 0;

        c = getopt_long(argc, argv, "i:o:f:",
                long_options, &option_index);

        /* Detect the end of the options. */
        if (c == -1)
            break;
        
        switch (c) {
            case 0:
                /* If this option set a flag, do nothing else now. */
                if (long_options[option_index].flag != 0)
                    break;
                cout << "option " << long_options[option_index].name;
                if (optarg)
                    cout << " with arg" << optarg;
                cout << endl;
                break;
                
            case 'i':
                input = optarg;
                break;

            case 'o':
                output = optarg;
                break;
                
            case 'f':
                frecuency = atoi(optarg);
                break;
            
            case '?':
                /* getopt_long already printed an error message. */
                break;

            default:
                abort();
        }
    }

    if(help_flag){
        print_help();
        exit(0);
    }
    
    /* Print any remaining command line arguments (not options). */
    if (optind < argc) {
        printf("> non-option ARGV-elements: ");
        while (optind < argc)
            printf("%s ", argv[optind++]);
        putchar('\n');
    }
    
    /* Instead of reporting ‘--verbose’
     * and ‘--brief’ as they are encountered,
     * we report the final status resulting from them. */
    if (verbose_flag)
        puts("> verbose flag is set");

    if (std_output_flag)
        puts("> standar output flag is set");
    
    if (verbose_flag){
        cout << "> Behaviour System'll check the minimal path after ";
        cout << frecuency << " frames." << endl;
    }
    
    cout << endl;
    
    if(input == NULL){
        puts("Error: You must specify an input video\n");
        print_help();
        exit(1);
    }else{
        struct stat buffer;   
        if(stat (input, &buffer) != 0){
            puts("Error: The input file does not exists\n");
            exit(1);
        }
    }

    if(output == NULL){
        std::string str("out.xml");
        output = new char[str.size() + 1];
        std::copy(str.begin(), str.end(), output);
        output[str.size()] = '\0'; // don't forget the terminating 0
    }
    
    createDirIfNotExists(output);
    
    cout << "Input: " << input << endl;
    cout << "Output: " << output << endl << endl;
    
    trackToFile(input, output, 0, 35, std_output_flag, frecuency);

    exit(0);
}