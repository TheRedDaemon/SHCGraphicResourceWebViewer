const std = @import("std");
const zigar = @import("zigar");
const types = @import("types.zig");

pub fn convertTgxToArgb(
    allocator: std.mem.Allocator,
    promise: zigar.function.Promise([]const u16),
    width: u32,
    height: u32,
    input: []const u8,
    pixel_repeat_threshold: u8,
    padding_alignment: u8,
) !void {
    _ = allocator;
    _ = promise;
    _ = width;
    _ = height;
    _ = input;
    _ = pixel_repeat_threshold;
    _ = padding_alignment;

    return error.NotImplemented;
}
