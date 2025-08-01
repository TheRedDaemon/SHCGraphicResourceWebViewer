const std = @import("std");
const types = @import("types.zig");

pub const Options = struct {
    pixel_repeat_threshold: u8,
    padding_alignment: u8,

    pub const default = Options{
        .pixel_repeat_threshold = 3,
        .padding_alignment = 4,
    };
};

pub var current_options = Options.default;

pub fn convertTgxToArgb(allocator: std.mem.Allocator, width: u32, height: u32, input: []const u8) ![]const u16 {
    _ = allocator;
    _ = width;
    _ = height;
    _ = input;

    return error.NotImplemented;
}
