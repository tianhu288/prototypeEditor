-- ---------------------------------------------------
-- 知启蒙原型设计数据库字典
-- ---------------------------------------------------


-- ---------------------------------------------------
-- 原型设计主表
-- ---------------------------------------------------

-- ---------------------------------------------------
-- 画布表
-- ---------------------------------------------------
-- Create table
create table PROTOTYPE_CANVAS
(
    PROTOTYPE_ID bigint NOT NULL,
    PROTOTYPE_NAME varchar(32) NOT NULL,
    PROTOTYPE_TYPE tinyint(4) NOT NULL,
    THUMB_URL text NOT NULL,
    APP_ICON_URL text NULL,
    CREATE_TIME char(19) NOT NULL,
    UPDATE_TIME char(19) NOT NULL,
    WIDTH decimal(16,8) NOT NULL,
    HEIGHT decimal(16,8) NOT NULL,
    CANVAS_LEFT decimal(16,8) NOT NULL,
    CANVAS_TOP decimal(16,8) NOT NULL,
    SCALE decimal(8,4) NOT NULL,
    SCREEN_ID bigint NOT NULL,
    SHOW_RULER tinyint(1) NOT NULL,
    SHOW_LEFT_PANEL tinyint(1) NOT NULL,
    SHOW_RIGHT_PANEL tinyint(1) NOT NULL,
    SHOW_GRID tinyint(1) NOT NULL,
    SHOW_LAYOUT tinyint(1) NOT NULL,
    LAYOUT_ROW_NUM int NOT NULL,
    LAYOUT_ROW_SPACE decimal(8,4) NOT NULL,
    LAYOUT_ROW_HEIGHT decimal(8,4) NOT NULL,
    LAYOUT_COLUMN_NUM int NOT NULL,
    LAYOUT_COLUMN_SPACE decimal(8,4) NOT NULL,
    LAYOUT_COLUMN_WIDTH decimal(8,4) NOT NULL,
    INIT_DONE tinyint(1) NOT NULL
)ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;
-- Create/Recreate primary, unique and foreign key constraints 
alter table PROTOTYPE_CANVAS add constraint PK_PROTOTYPE_CANVAS primary key (PROTOTYPE_ID);

-- ---------------------------------------------------
-- 页面表
-- ---------------------------------------------------
-- Create table
create table PROTOTYPE_SCREEN
(
    PROTOTYPE_ID bigint NOT NULL,
    ID bigint NOT NULL,
    PID bigint NOT NULL,
    TITLE varchar(32) NOT NULL,
    FILE_NAME varchar(32) NOT NULL,
    THUMB_URL text NOT NULL,
    EDITABLE tinyint(4) NOT NULL,
    WIDTH decimal(16,8) NOT NULL,
    HEIGHT decimal(16,8) NOT NULL,
    HEIGHT_AUTO tinyint(1) NOT NULL,
    LINES_HORIZONTAL text NULL,
    LINES_VERTICAL text NULL,
    ACTION text NULL
)ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;
-- Create/Recreate primary, unique and foreign key constraints 
alter table PROTOTYPE_SCREEN add constraint PK_PROTOTYPE_SCREEN primary key (PROTOTYPE_ID,ID);

-- ---------------------------------------------------
-- 元素表
-- ---------------------------------------------------
-- Create table
create table PROTOTYPE_ELEMENT
(
    PROTOTYPE_ID bigint NOT NULL,
    SCREEN_ID bigint NOT NULL,
    ID bigint NOT NULL,
    Z_INDEX bigint NOT NULL,
    TITLE varchar(32) NOT NULL,
    TYPE varchar(16) NOT NULL,
    SEC_TYPE varchar(16) NULL,
    ELE_STATUS tinyint(4) NOT NULL,
    THUMB_URL text NOT NULL,
    EDITABLE tinyint(4) NOT NULL,
    ELE_KEYS text NULL,
    HTML_SOURCE text NULL,
    WIDTH decimal(16,8) NOT NULL,
    HEIGHT decimal(16,8) NOT NULL,
    X decimal(16,8) NOT NULL,
    X_RIGHT tinyint(1) NOT NULL,
    Y decimal(16,8) NOT NULL,
    Y_BOTTOM tinyint(1) NOT NULL,
    ROTATION int NOT NULL,
    OPACITY decimal(8,4) NOT NULL,
    AUTO_SIZE tinyint(1) NOT NULL,
    LOCKED tinyint(1) NOT NULL,
    VISIBLE tinyint(1) NOT NULL,
    PROPAGATE_EVENTS tinyint(1) NOT NULL,
    LIB_ID bigint NULL,
    LIB_TITLE varchar(32) NULL,
    BACKGROUND_COLOR varchar(16) NULL,
    BORDER_WIDTH int NULL,
    BORDER_STYLE varchar(16) NULL,
    BORDER_COLOR varchar(16) NULL,
    RADIUS_TOP_LEFT int NULL,
    RADIUS_TOP_RIGHT int NULL,
    RADIUS_BOTTOM_LEFT int NULL,
    RADIUS_BOTTOM_RIGHT int NULL,
    ACTION text NULL,
    ENABLE_MASK tinyint(1) NOT NULL,
    MASK text NULL,
    ENABLE_SHADOW tinyint(1) NOT NULL,
    SHADOW_COLOR varchar(16) NULL,
    SHADOW_X int NULL,
    SHADOW_Y int NULL,
    SHADOW_BLUR int NULL,
    ENABLE_FILTER tinyint(1) NOT NULL,
    FILTER_BLUR decimal(8,4) NULL,
    FILTER_SATURATION decimal(8,4) NULL,
    FILTER_BRIGHTNESS decimal(8,4) NULL,
    FILTER_CONTRAST decimal(8,4) NULL,
    FILTER_GRAYSCALE decimal(8,4) NULL,
    FILTER_SEPIA decimal(8,4) NULL,
    FILTER_HUE decimal(8,4) NULL,
    FILTER_INVERT decimal(8,4) NULL,
    ENABLE_TRANSITION tinyint(1) NOT NULL,
    TEXT text NULL,
    TEXT_HEIGHT_AUTO tinyint(1) NULL,
    TEXT_FONT varchar(100) NULL,
    TEXT_SIZE int NULL,
    TEXT_COLOR varchar(16) NULL,
    LINE_HEIGHT decimal(8,4) NULL,
    LINE_HEIGHT_AUTO tinyint(1) NULL,
    LETTER_SPACE decimal(8,4) NULL,
    TEXT_ALIGN varchar(16) NULL,
    VERTICAL_ALIGN varchar(16) NULL,
    TEXT_BOLD tinyint(1) NULL,
    TEXT_ITALIC tinyint(1) NULL,
    TEXT_UNDERLINE tinyint(1) NULL,
    TEXT_SHADOW_X int NULL,
    TEXT_SHADOW_Y int NULL,
    TEXT_SHADOW_BLUR int NULL,
    ICON_CLASS varchar(32) NULL,
    IMAGE_FILE text NULL,
    IMAGE_REPEAT tinyint(1) NULL,
    ASPECT_RATIO decimal(16,8) NULL,
    SHAPE_TYPE_NAME varchar(16) NULL,
    URL varchar(200) NULL,
    SCROLLABLE tinyint(1) NULL,
    HTML text NULL,
    AUDIO_WAV text NULL,
    AUDIO_MP3 text NULL,
    AUDIO_OGG text NULL,
    AUDIO_AAC text NULL,
    VIDEO_TYPE varchar(16) NULL,
    VIDEO_MP4 text NULL,
    VIDEO_OGG text NULL,
    VIDEO_WEBM text NULL,
    VIDEO_PLACEHOLDER text NULL,
    CONTROLS tinyint(1) NULL,
    PRELOAD tinyint(1) NULL,
    AUTOPLAY tinyint(1) NULL,
    AUTOPLAY_OFF tinyint(1) NULL,
    DO_LOOP tinyint(1) NULL,
    DATE_GENERAL_FORMAT varchar(16) NULL,
    DATE_FORMAT varchar(16) NULL,
    DAY_FORMAT varchar(16) NULL,
    MONTH_FORMAT varchar(16) NULL,
    YEAR_FORMAT varchar(16) NULL,
    TIME_FORMAT varchar(16) NULL,
    DAY_NAME_FORMAT varchar(16) NULL,
    DATE_SEPARATOR varchar(16) NULL
)ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;
-- Create/Recreate primary, unique and foreign key constraints 
alter table PROTOTYPE_ELEMENT add constraint PK_PROTOTYPE_ELEMENT primary key (PROTOTYPE_ID,SCREEN_ID,ID);

-- ---------------------------------------------------
-- 组件表
-- ---------------------------------------------------
-- Create table
create table PROTOTYPE_LIB
(
    PROTOTYPE_ID bigint NOT NULL,
    SCREEN_ID bigint NOT NULL,
    ID bigint NOT NULL,
    PID bigint NOT NULL,
    TITLE varchar(32) NOT NULL,
    TYPE varchar(16) NOT NULL,
    SEC_TYPE varchar(16) NULL,
    LIB_STATUS tinyint(4) NOT NULL,
    THUMB_URL text NOT NULL,
    EDITABLE tinyint(4) NOT NULL,
    LIB_KEYS text NULL,
    WIDTH decimal(16,8) NOT NULL,
    HEIGHT decimal(16,8) NOT NULL,
    X decimal(16,8) NOT NULL,
    X_RIGHT tinyint(1) NOT NULL,
    Y decimal(16,8) NOT NULL,
    Y_BOTTOM tinyint(1) NOT NULL,
    ROTATION int NOT NULL,
    OPACITY decimal(8,4) NOT NULL,
    LOCKED tinyint(1) NOT NULL,
    VISIBLE tinyint(1) NOT NULL,
    ACTION text NULL,
    ENABLE_SHADOW tinyint(1) NOT NULL,
    SHADOW_COLOR varchar(16) NULL,
    SHADOW_X int NULL,
    SHADOW_Y int NULL,
    SHADOW_BLUR int NULL
)ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;
-- Create/Recreate primary, unique and foreign key constraints 
alter table PROTOTYPE_LIB add constraint PK_PROTOTYPE_LIB primary key (PROTOTYPE_ID,SCREEN_ID,ID);

-- ---------------------------------------------------
-- 系统元素表
-- ---------------------------------------------------
-- Create table
create table SYSTEM_ELEMENT
(
    ID bigint NOT NULL,
    TITLE varchar(32) NOT NULL,
    Z_INDEX bigint NOT NULL,
    TYPE varchar(16) NOT NULL,
    SEC_TYPE varchar(16) NULL,
    ELE_STATUS tinyint(4) NOT NULL,
    THUMB_URL text NOT NULL,
    EDITABLE tinyint(4) NOT NULL,
    ELE_KEYS text NULL,
    HTML_SOURCE text NULL,
    WIDTH decimal(16,8) NOT NULL,
    HEIGHT decimal(16,8) NOT NULL,
    X decimal(16,8) NOT NULL,
    X_RIGHT tinyint(1) NOT NULL,
    Y decimal(16,8) NOT NULL,
    Y_BOTTOM tinyint(1) NOT NULL,
    ROTATION int NOT NULL,
    OPACITY decimal(8,4) NOT NULL,
    AUTO_SIZE tinyint(1) NOT NULL,
    LOCKED tinyint(1) NOT NULL,
    VISIBLE tinyint(1) NOT NULL,
    PROPAGATE_EVENTS tinyint(1) NOT NULL,
    LIB_ID bigint NULL,
    LIB_TITLE varchar(32) NULL,
    BACKGROUND_COLOR varchar(16) NULL,
    BORDER_WIDTH int NULL,
    BORDER_STYLE varchar(16) NULL,
    BORDER_COLOR varchar(16) NULL,
    RADIUS_TOP_LEFT int NULL,
    RADIUS_TOP_RIGHT int NULL,
    RADIUS_BOTTOM_LEFT int NULL,
    RADIUS_BOTTOM_RIGHT int NULL,
    ACTION text NULL,
    ENABLE_MASK tinyint(1) NOT NULL,
    MASK text NULL,
    ENABLE_SHADOW tinyint(1) NOT NULL,
    SHADOW_COLOR varchar(16) NULL,
    SHADOW_X int NULL,
    SHADOW_Y int NULL,
    SHADOW_BLUR int NULL,
    ENABLE_FILTER tinyint(1) NOT NULL,
    FILTER_BLUR decimal(8,4) NULL,
    FILTER_SATURATION decimal(8,4) NULL,
    FILTER_BRIGHTNESS decimal(8,4) NULL,
    FILTER_CONTRAST decimal(8,4) NULL,
    FILTER_GRAYSCALE decimal(8,4) NULL,
    FILTER_SEPIA decimal(8,4) NULL,
    FILTER_HUE decimal(8,4) NULL,
    FILTER_INVERT decimal(8,4) NULL,
    ENABLE_TRANSITION tinyint(1) NOT NULL,
    TEXT text NULL,
    TEXT_HEIGHT_AUTO tinyint(1) NULL,
    TEXT_FONT varchar(100) NULL,
    TEXT_SIZE int NULL,
    TEXT_COLOR varchar(16) NULL,
    LINE_HEIGHT decimal(8,4) NULL,
    LINE_HEIGHT_AUTO tinyint(1) NULL,
    LETTER_SPACE decimal(8,4) NULL,
    TEXT_ALIGN varchar(16) NULL,
    VERTICAL_ALIGN varchar(16) NULL,
    TEXT_BOLD tinyint(1) NULL,
    TEXT_ITALIC tinyint(1) NULL,
    TEXT_UNDERLINE tinyint(1) NULL,
    TEXT_SHADOW_X int NULL,
    TEXT_SHADOW_Y int NULL,
    TEXT_SHADOW_BLUR int NULL,
    ICON_CLASS varchar(32) NULL,
    IMAGE_FILE text NULL,
    IMAGE_REPEAT tinyint(1) NULL,
    ASPECT_RATIO decimal(16,8) NULL,
    SHAPE_TYPE_NAME varchar(16) NULL,
    URL varchar(200) NULL,
    SCROLLABLE tinyint(1) NULL,
    HTML text NULL,
    AUDIO_WAV text NULL,
    AUDIO_MP3 text NULL,
    AUDIO_OGG text NULL,
    AUDIO_AAC text NULL,
    VIDEO_TYPE varchar(16) NULL,
    VIDEO_MP4 text NULL,
    VIDEO_OGG text NULL,
    VIDEO_WEBM text NULL,
    VIDEO_PLACEHOLDER text NULL,
    CONTROLS tinyint(1) NULL,
    PRELOAD tinyint(1) NULL,
    AUTOPLAY tinyint(1) NULL,
    AUTOPLAY_OFF tinyint(1) NULL,
    DO_LOOP tinyint(1) NULL,
    DATE_GENERAL_FORMAT varchar(16) NULL,
    DATE_FORMAT varchar(16) NULL,
    DAY_FORMAT varchar(16) NULL,
    MONTH_FORMAT varchar(16) NULL,
    YEAR_FORMAT varchar(16) NULL,
    TIME_FORMAT varchar(16) NULL,
    DAY_NAME_FORMAT varchar(16) NULL,
    DATE_SEPARATOR varchar(16) NULL
)ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;
-- Create/Recreate primary, unique and foreign key constraints 
alter table SYSTEM_ELEMENT add constraint PK_SYSTEM_ELEMENT primary key (ID,TITLE,Z_INDEX);

-- ---------------------------------------------------
-- 系统组件表
-- ---------------------------------------------------
-- Create table
create table SYSTEM_LIB
(
    ID bigint NOT NULL,
    PID bigint NOT NULL,
    TITLE varchar(32) NOT NULL,
    PROTOTYPE_TYPE tinyint(4) NOT NULL,
    TYPE varchar(16) NOT NULL,
    SEC_TYPE varchar(16) NULL,
    LIB_STATUS tinyint(4) NOT NULL,
    THUMB_URL text NOT NULL,
    EDITABLE tinyint(4) NOT NULL,
    LIB_KEYS text NULL,
    WIDTH decimal(16,8) NOT NULL,
    HEIGHT decimal(16,8) NOT NULL,
    X decimal(16,8) NOT NULL,
    X_RIGHT tinyint(1) NOT NULL,
    Y decimal(16,8) NOT NULL,
    Y_BOTTOM tinyint(1) NOT NULL,
    ROTATION int NOT NULL,
    OPACITY decimal(8,4) NOT NULL,
    LOCKED tinyint(1) NOT NULL,
    VISIBLE tinyint(1) NOT NULL,
    ACTION text NULL,
    ENABLE_SHADOW tinyint(1) NOT NULL,
    SHADOW_COLOR varchar(16) NULL,
    SHADOW_X int NULL,
    SHADOW_Y int NULL,
    SHADOW_BLUR int NULL
)ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;
-- Create/Recreate primary, unique and foreign key constraints 
alter table SYSTEM_LIB add constraint PK_SYSTEM_LIB primary key (ID,PID);

-- ---------------------------------------------------
-- 用户组件表
-- ---------------------------------------------------
-- Create table
create table USER_LIB
(
    USER_ID bigint NOT NULL,
    USER_TYPE varchar(16) NOT NULL,
    PROTOTYPE_TYPE tinyint(4) NOT NULL,
    ID bigint NOT NULL,
    PID bigint NOT NULL,
    TITLE varchar(32) NOT NULL,
    TYPE varchar(16) NOT NULL,
    SEC_TYPE varchar(16) NULL,
    LIB_STATUS tinyint(4) NOT NULL,
    THUMB_URL text NOT NULL,
    EDITABLE tinyint(4) NOT NULL,
    LIB_KEYS text NULL,
    WIDTH decimal(16,8) NOT NULL,
    HEIGHT decimal(16,8) NOT NULL,
    X decimal(16,8) NOT NULL,
    X_RIGHT tinyint(1) NOT NULL,
    Y decimal(16,8) NOT NULL,
    Y_BOTTOM tinyint(1) NOT NULL,
    ROTATION int NOT NULL,
    OPACITY decimal(8,4) NOT NULL,
    LOCKED tinyint(1) NOT NULL,
    VISIBLE tinyint(1) NOT NULL,
    ACTION text NULL,
    ENABLE_SHADOW tinyint(1) NOT NULL,
    SHADOW_COLOR varchar(16) NULL,
    SHADOW_X int NULL,
    SHADOW_Y int NULL,
    SHADOW_BLUR int NULL
)ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;
-- Create/Recreate primary, unique and foreign key constraints 
alter table USER_LIB add constraint PK_USER_LIB primary key (USER_ID,USER_TYPE,ID,PID);

-- ---------------------------------------------------
-- 元素分类表
-- ---------------------------------------------------
-- Create table
create table ELEMENT_CLASSIFICATION
(
    ID bigint NOT NULL,
    PID bigint NOT NULL,
    PARENT varchar(16) NULL,
    CLS_CODE varchar(16) NOT NULL,
    CLS_NAME varchar(16) NOT NULL,
    CLS_STATUS tinyint(4) NOT NULL,
    CLS_ICON text NULL,
    CLS_KEYS varchar(500) NULL
)ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;
-- Create/Recreate primary, unique and foreign key constraints 
alter table ELEMENT_CLASSIFICATION add constraint PK_ELEMENT_CLASSIFICATION primary key (ID,PID);

-- ---------------------------------------------------
-- 组件分类表
-- ---------------------------------------------------
-- Create table
create table LIB_CLASSIFICATION
(
    ID bigint NOT NULL,
    PID bigint NOT NULL,
    CLS_STYLE tinyint(4) NOT NULL,
    CLS_CODE varchar(16) NOT NULL,
    CLS_NAME varchar(16) NOT NULL,
    CLS_STATUS tinyint(4) NOT NULL,
    CLS_KEYS varchar(500) NULL
)ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;
-- Create/Recreate primary, unique and foreign key constraints 
alter table LIB_CLASSIFICATION add constraint PK_LIB_CLASSIFICATION primary key (ID,PID);

-- ---------------------------------------------------
-- 用户组件分类表
-- ---------------------------------------------------
-- Create table
create table USER_LIB_CLASSIFICATION
(
    USER_ID bigint NOT NULL,
    ID bigint NOT NULL,
    PID bigint NOT NULL,
    CLS_CODE varchar(16) NOT NULL
)ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;
-- Create/Recreate primary, unique and foreign key constraints 
alter table USER_LIB_CLASSIFICATION add constraint PK_USER_LIB_CLASSIFICATION primary key (USER_ID,);


-- ---------------------------------------------------
-- 知启蒙原型设计数据库字典创建完成
-- ---------------------------------------------------
