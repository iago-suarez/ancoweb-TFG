#
# Generated Makefile - do not edit!
#
# Edit the Makefile in the project folder instead (../Makefile). Each target
# has a -pre and a -post target defined where you can add customized code.
#
# This makefile implements configuration specific macros and targets.


# Environment
MKDIR=mkdir
CP=cp
GREP=grep
NM=nm
CCADMIN=CCadmin
RANLIB=ranlib
CC=gcc
CCC=g++
CXX=g++
FC=gfortran
AS=as

# Macros
CND_PLATFORM=GNU-Linux-x86
CND_DLIB_EXT=so
CND_CONF=Release
CND_DISTDIR=dist
CND_BUILDDIR=build

# Include project Makefile
include Makefile

# Object Directory
OBJECTDIR=${CND_BUILDDIR}/${CND_CONF}/${CND_PLATFORM}

# Object Files
OBJECTFILES= \
	${OBJECTDIR}/XmlRecognition/source/RecognitionFacade.o \
	${OBJECTDIR}/XmlRecognition/source/XmlUtils.o \
	${OBJECTDIR}/XmlRecognition/source/main.o


# C Compiler Flags
CFLAGS=

# CC Compiler Flags
CCFLAGS=
CXXFLAGS=

# Fortran Compiler Flags
FFLAGS=

# Assembler Flags
ASFLAGS=

# Link Libraries and Options
LDLIBSOPTIONS=

# Build Targets
.build-conf: ${BUILD_SUBPROJECTS}
	"${MAKE}"  -f nbproject/Makefile-${CND_CONF}.mk ${CND_DISTDIR}/${CND_CONF}/${CND_PLATFORM}/recognitionsystem

${CND_DISTDIR}/${CND_CONF}/${CND_PLATFORM}/recognitionsystem: ${OBJECTFILES}
	${MKDIR} -p ${CND_DISTDIR}/${CND_CONF}/${CND_PLATFORM}
	${LINK.cc} -o ${CND_DISTDIR}/${CND_CONF}/${CND_PLATFORM}/recognitionsystem ${OBJECTFILES} ${LDLIBSOPTIONS}

${OBJECTDIR}/XmlRecognition/source/RecognitionFacade.o: XmlRecognition/source/RecognitionFacade.cpp 
	${MKDIR} -p ${OBJECTDIR}/XmlRecognition/source
	${RM} "$@.d"
	$(COMPILE.cc) -O2 -MMD -MP -MF "$@.d" -o ${OBJECTDIR}/XmlRecognition/source/RecognitionFacade.o XmlRecognition/source/RecognitionFacade.cpp

${OBJECTDIR}/XmlRecognition/source/XmlUtils.o: XmlRecognition/source/XmlUtils.cpp 
	${MKDIR} -p ${OBJECTDIR}/XmlRecognition/source
	${RM} "$@.d"
	$(COMPILE.cc) -O2 -MMD -MP -MF "$@.d" -o ${OBJECTDIR}/XmlRecognition/source/XmlUtils.o XmlRecognition/source/XmlUtils.cpp

${OBJECTDIR}/XmlRecognition/source/main.o: XmlRecognition/source/main.cpp 
	${MKDIR} -p ${OBJECTDIR}/XmlRecognition/source
	${RM} "$@.d"
	$(COMPILE.cc) -O2 -MMD -MP -MF "$@.d" -o ${OBJECTDIR}/XmlRecognition/source/main.o XmlRecognition/source/main.cpp

# Subprojects
.build-subprojects:

# Clean Targets
.clean-conf: ${CLEAN_SUBPROJECTS}
	${RM} -r ${CND_BUILDDIR}/${CND_CONF}
	${RM} ${CND_DISTDIR}/${CND_CONF}/${CND_PLATFORM}/recognitionsystem

# Subprojects
.clean-subprojects:

# Enable dependency checking
.dep.inc: .depcheck-impl

include .dep.inc
