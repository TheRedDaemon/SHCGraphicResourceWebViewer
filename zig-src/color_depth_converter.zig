const std = @import("std");
const types = @import("types.zig");

pub const Options = struct {
    alpha_threshold: u8,

    pub const default = Options{
        .alpha_threshold = 127,
    };
};

pub var current_options = Options.default;

pub fn reduceColorDepthOfRgba8888ToArgb1555(input: []u8) !void {
    if (input.len % 4 != 0) return error.InvalidInputSize;
    const rgba_image = std.mem.bytesAsSlice(types.Rgba8888, input);
    for (rgba_image) |*rgba| {
        rgba.r = rgba.r >> 3;
        rgba.g = rgba.g >> 3;
        rgba.b = rgba.b >> 3;
        rgba.a = if (rgba.a > current_options.alpha_threshold) 1 else 0;

        rgba.r = (rgba.r << 3) | (rgba.r >> 2);
        rgba.g = (rgba.g << 3) | (rgba.g >> 2);
        rgba.b = (rgba.b << 3) | (rgba.b >> 2);
        rgba.a = if (rgba.a > 0) 255 else 0;
    }
}

pub fn convertRgba8888ToArgb1555(allocator: std.mem.Allocator, input: []const u8) ![]const u16 {
    if (input.len % 4 != 0) return error.InvalidInputSize;
    const rgba_image = std.mem.bytesAsSlice(types.Rgba8888, input);

    const output = try allocator.alloc(types.Argb1555, rgba_image.len);
    errdefer allocator.free(output);

    for (rgba_image, output) |*rgba, *argb| {
        argb.r = @truncate(rgba.r >> 3);
        argb.g = @truncate(rgba.g >> 3);
        argb.b = @truncate(rgba.b >> 3);
        argb.a = if (current_options.alpha_threshold > rgba.a) 1 else 0;
    }
    return std.mem.bytesAsSlice(u16, std.mem.sliceAsBytes(output));
}

// source: https://stackoverflow.com/a/71109890
pub fn convertArgb1555ToRgba8888(allocator: std.mem.Allocator, input: []const u16) ![]const u8 {
    const argb_image = std.mem.bytesAsSlice(types.Argb1555, std.mem.sliceAsBytes(input));

    const output = try allocator.alloc(types.Rgba8888, argb_image.len);
    errdefer allocator.free(output);

    for (argb_image, output) |*argb, *rgba| {
        rgba.r = (@as(u8, argb.r) << 3) | (@as(u8, argb.r) >> 2);
        rgba.g = (@as(u8, argb.g) << 3) | (@as(u8, argb.g) >> 2);
        rgba.b = (@as(u8, argb.b) << 3) | (@as(u8, argb.b) >> 2);
        rgba.a = if (argb.a == 1) 255 else 0;
    }
    return std.mem.sliceAsBytes(output);
}
