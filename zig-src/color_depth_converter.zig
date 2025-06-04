const types = @import("types.zig");

pub const Options = struct {
    alpha_threshold: u8,

    pub const default = Options{
        .alpha_threshold = 127,
    };
};
pub const options_default = Options.default;
