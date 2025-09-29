package org.orderingsystem.grocerryorderingsystem.controller.inventory;

import java.util.List;

public record PageResp<T>(List<T> items, long total) {}
