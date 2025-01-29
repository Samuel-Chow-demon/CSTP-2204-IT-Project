# CSTP 2204 IT Project

## <span style="color: rgb(191, 219, 162);">Team 1
### Tsz Chun Chow, Samuel (Team Leader)

### Phucthien Bao Nguyen, Peter

### Alexander Regis, Alex

### Frack Wang, Frack

### Diya Sharma, Diya
<br>

## <span style="color: rgb(114, 207, 166);">1. Project Idea
- ### Real-time parking space detection, statistic and API
<br>

## <span style="color: rgb(114, 207, 166);">2. Product Name
- ### ParkSync, ESeePark, ParkSaveTime, ParkStat .... (Temporary)
<br>

## <span style="color: rgb(114, 207, 166);">3. Background
- ### <span style="text-align: justify;"> Finding public parking space constantly is a challenge for drivers, especially at the high-demand or popular area like commerical center, arena or community-oriented areas. People often need to drive to the parking area before realizing whether there are any vanact space available. This inconvenience inspires the idea of a web application that provides real-time parking space detection and statistical services. </span>
<br>

## <span style="color: rgb(114, 207, 166);">4. Application Overviews
### Provide real-time parking vacancy statistic on different location (public parking area)
 - Through APP UI Dashboard
 - Through API request by third-party application
 
<br>

## <span style="color: rgb(114, 207, 166);">5. Target Audience
- ### Public user, Car Parking Commerical, Third-Party Application
<br>

## <span style="color: rgb(114, 207, 166);">6. Components
- ### Backend
    - ### Car Parking Image Detection
        |Platform|Framework|Dataset|
        |-|-|-|
        |Python|OpenCV, YOLO (Ultralytics)|RoboFlow Platform Dataset|
        ||||
    <br>

    - ### API support for parking statistic data request
        |Plaform|Framework|Database|
        |-|-|-|
        |Python|FastAPI, JWT etc.|Firebase (API key)
        ||||
    <br>

    - ### Parking Statistic Dashboard (Mobile-Major, Desktop)
        |Platform|Framework|Database|
        |-|-|-|
        |Javascript|NodeJS, React|Firebase (Account)|
        ||||
    <br>

## <span style="color: rgb(114, 207, 166);">7. Project Management and Communication
- ### Trello WorkSpace
    - Work Distribution And Schedule
- ### One Drive
    - File Sharing and Storage
- ### Figma 
    - Graph and Diagram
- ### Discord
    - Communication

<br>

## <span style="color: rgb(114, 207, 166);">8. Technologies
- ### 8.1 Object Detection by YOLO
    - YOLO (You Only Look Once) model is a type of CNN (Convolutional Neural Network) architecture designed specifically for real-time object detection

    - YOLO is built on a Convolutional Neural Network backbone. The CNN layers extract spatial features from the image, such as edges, shapes, and textures, and use them to detect and classify objects.



    ### Key components:
    - <u>A. Convolutional Layers</u>

        - These layers extract features like object boundaries textures, and patterns. YOLO uses a backbone network (e.g., Darknet, CSPNet, or others) as the feature extractor.

    - <u>B. Feature Maps</u>

        - The convolutional layers output feature maps, which are grids representing the image's spatial information and depth (channels).

    - <u>C. Bounding Box Prediction</u> 

        - The network divides the image into an S×S grid and predicts bounding boxes, class probabilities, and confidence scores for each grid cell.

- ### 8.2 Google Colab
    - Making use of google provided cloud GPU engine linux instance for YOLO model training

    - jupyter notebook platform (Python)

- ### 8.3 FireStore (NoSQL Database)
- ### 8.4 API Key Serialization, Salting And Validation
- ### 8.5 Amazon Web Service (AWS) Deployment
- ### 8.6 Data Image Acquisition by Drone
    - [Rules of Operation (click me)](https://tc.canada.ca/en/aviation/drone-safety/learn-rules-you-fly-your-drone/find-your-category-drone-operation
    )