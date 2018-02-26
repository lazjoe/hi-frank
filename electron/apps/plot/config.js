exports.commands = [
    {
        keywords: ["scale"],
        action: "set_axis_scale",
        args: [
            {
                axis: {
                    type: "string",
                    range: "x, x0, x1, y, y0, y1 ,bottom, top, left, right"
                },
                lower_limit: {
                    type: "number"
                },
                upper_limit: {
                    type: "number"
                }
            }
        ]
    },
    {
        keywords: ["reverse"],
        action: "reverse_axis_scale",
        args: [
            {
                axis: {
                    type: "string",
                    range: "x, x0, x1, y, y0, y1 ,bottom, top, left, right"
                }
            }
        ]
    }
]
