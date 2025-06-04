pub const Options = struct {
    pixel_repeat_threshold: u8,
    padding_alignment: u8,

    pub const default = Options{
        .pixel_repeat_threshold = 3,
        .padding_alignment = 4,
    };
};

pub var current_options = Options.default;
