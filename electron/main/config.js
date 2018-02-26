exports.config = {
    version: "1.0",
    apps: [
        {
            name: "phit",
            description: "phi translator",
            entry: "phit", /* phit/_.html */  
            settings: {"width": 1280, "height": 720}  
        },
        {
            name: "plot",
            description: "general plotting",
            entry: "plot",  
            settings: {"useContentSize": true, "width": 600, "height": 520},  
        },
        {
            name: "word_agent",
            alias: "wa",
            description: "word openxml reader",
            entry: "word_agent"    
        },
        {
            name: "clipboard",
            alias: "cb",
            description: "clipboard reader",
            entry: "clipboard"    
        },
        {
            name: "g_plot",
            alias: "gplot",
            keywords: "g plot datafrac",
            description: "G plot",
            entry: "datafrac/g_plot"    
        }
    ],
    workflows: [
        {
            name: "datafrac",
            alias: "df",
            description: "workflow injection test interpretation"
        }
    ]
}