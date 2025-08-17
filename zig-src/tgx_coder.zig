const std = @import("std");
const types = @import("types.zig");

pub fn convertTgxToArgb(
    allocator: std.mem.Allocator,
    width: u32,
    height: u32,
    input: []const u8,
    pixel_repeat_threshold: u8,
    padding_alignment: u8,
) ![]const u16 {
    _ = allocator;
    _ = width;
    _ = height;
    _ = input;
    _ = pixel_repeat_threshold;
    _ = padding_alignment;

    return error.NotImplemented;
}
